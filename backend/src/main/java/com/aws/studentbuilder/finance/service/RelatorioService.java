package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.*;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.Lancamento;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.LancamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class RelatorioService {

    private static final Logger logger = LoggerFactory.getLogger(RelatorioService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DecimalFormat BRL_FORMAT = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));
    private static final DecimalFormat USD_FORMAT = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(Locale.US));

    private final EventoRepository eventoRepository;
    private final OrcamentoService orcamentoService;
    private final LancamentoService lancamentoService;
    private final LancamentoRepository lancamentoRepository;
    private final ParceriaService parceriaService;
    private final BrindeService brindeService;
    private final StorageService storageService;
    private final ConfigService configService;

    public RelatorioService(
            EventoRepository eventoRepository,
            OrcamentoService orcamentoService,
            LancamentoService lancamentoService,
            LancamentoRepository lancamentoRepository,
            ParceriaService parceriaService,
            BrindeService brindeService,
            StorageService storageService,
            ConfigService configService
    ) {
        this.eventoRepository = eventoRepository;
        this.orcamentoService = orcamentoService;
        this.lancamentoService = lancamentoService;
        this.lancamentoRepository = lancamentoRepository;
        this.parceriaService = parceriaService;
        this.brindeService = brindeService;
        this.storageService = storageService;
        this.configService = configService;
    }

    @Transactional(readOnly = true)
    public RelatorioEventoDTO obterRelatorioEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + eventoId));

        List<ItemOrcamentoDTO> itensOrcamento = orcamentoService.listar(eventoId);
        List<LancamentoDTO> lancamentos = lancamentoService.filtrar(eventoId, null, null, null, null, null);
        List<ParceriaDTO> parcerias = parceriaService.listar(eventoId);
        List<BrindeDTO> brindes = brindeService.listar(eventoId, null);

        BigDecimal totalOrcadoUsd = itensOrcamento.stream()
                .map(ItemOrcamentoDTO::getValorOrcadoUsd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOrcadoBrl = itensOrcamento.stream()
                .map(ItemOrcamentoDTO::getValorOrcadoBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRealizadoBrl = lancamentos.stream()
                .map(LancamentoDTO::getValorBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRealizadoUsd = lancamentos.stream()
                .map(LancamentoDTO::getValorUsd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoRestanteBrl = totalOrcadoBrl.subtract(totalRealizadoBrl);
        BigDecimal saldoRestanteUsd = totalOrcadoUsd.subtract(totalRealizadoUsd);

        double percentualExecucao = 0.0;
        if (totalOrcadoBrl.compareTo(BigDecimal.ZERO) > 0) {
            percentualExecucao = totalRealizadoBrl.divide(totalOrcadoBrl, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        int totalComprovantes = (int) lancamentos.stream()
                .filter(l -> l.getAnexoUrl() != null && !l.getAnexoUrl().isBlank())
                .count();

        return new RelatorioEventoDTO(
                evento.getId(),
                evento.getNome(),
                evento.getData(),
                evento.getStatus(),
                totalOrcadoUsd,
                totalOrcadoBrl,
                totalRealizadoUsd,
                totalRealizadoBrl,
                saldoRestanteBrl,
                saldoRestanteUsd,
                percentualExecucao,
                lancamentos.size(),
                totalComprovantes,
                itensOrcamento,
                lancamentos,
                parcerias,
                brindes
        );
    }

    @Transactional(readOnly = true)
    public void gerarPacotePrestacaoContasZip(Long eventoId, OutputStream outputStream) throws IOException {
        RelatorioEventoDTO relatorio = obterRelatorioEvento(eventoId);
        Specification<Lancamento> spec = (root, query, cb) -> cb.equal(root.get("evento").get("id"), eventoId);
        List<Lancamento> lancamentoEntities = lancamentoRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "data"));

        try (ZipOutputStream zos = new ZipOutputStream(outputStream, StandardCharsets.UTF_8)) {
            // 1. Arquivo CSV estruturado com BOM para compatibilidade com Microsoft Excel
            ZipEntry csvEntry = new ZipEntry("relatorio-financeiro-" + sanitizarNome(relatorio.eventoNome()) + ".csv");
            zos.putNextEntry(csvEntry);
            gerarCsvLancamentosStream(relatorio, zos);
            zos.closeEntry();

            // 2. Sumário executivo em texto
            ZipEntry resumoEntry = new ZipEntry("resumo-prestacao-contas.txt");
            zos.putNextEntry(resumoEntry);
            gerarResumoTxtStream(relatorio, zos);
            zos.closeEntry();

            // 3. Comprovantes e Notas Fiscais anexados
            int anexoIdx = 1;
            for (Lancamento lancamento : lancamentoEntities) {
                if (lancamento.getAnexoUrl() != null && !lancamento.getAnexoUrl().isBlank()) {
                    try {
                        Resource resource = storageService.loadAsResource(lancamento.getAnexoUrl());
                        if (resource.exists() && resource.isReadable()) {
                            String originalName = lancamento.getAnexoNomeOriginal() != null && !lancamento.getAnexoNomeOriginal().isBlank()
                                    ? lancamento.getAnexoNomeOriginal()
                                    : "comprovante";

                            String ext = "";
                            int dotIdx = originalName.lastIndexOf('.');
                            if (dotIdx > 0) {
                                ext = originalName.substring(dotIdx);
                            }

                            String safeFornecedor = sanitizarNome(lancamento.getFornecedor() != null ? lancamento.getFornecedor() : "fornecedor");
                            String nfPrefix = (lancamento.getNumeroNotaFiscal() != null && !lancamento.getNumeroNotaFiscal().isBlank())
                                    ? sanitizarNome(lancamento.getNumeroNotaFiscal())
                                    : "SEM-NF";

                            String safeZipPath = String.format("comprovantes/%02d_%s_%s_R$%s%s",
                                    anexoIdx++,
                                    nfPrefix,
                                    safeFornecedor,
                                    lancamento.getValorBrl().setScale(2, RoundingMode.HALF_UP).toString().replace(".", "_"),
                                    ext
                            );

                            ZipEntry attachmentEntry = new ZipEntry(safeZipPath);
                            zos.putNextEntry(attachmentEntry);

                            try (InputStream in = resource.getInputStream()) {
                                in.transferTo(zos);
                            }
                            zos.closeEntry();
                        } else {
                            logger.warn("Comprovante não encontrado para lançamento ID: {}", lancamento.getId());
                        }
                    } catch (Exception e) {
                        logger.error("Erro ao incluir comprovante no ZIP para lançamento ID {}: {}", lancamento.getId(), e.getMessage());
                    }
                }
            }
            zos.finish();
        }
    }

    public byte[] gerarCsvBytes(Long eventoId) throws IOException {
        RelatorioEventoDTO relatorio = obterRelatorioEvento(eventoId);
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        gerarCsvLancamentosStream(relatorio, baos);
        return baos.toByteArray();
    }

    private void gerarCsvLancamentosStream(RelatorioEventoDTO relatorio, OutputStream os) throws IOException {
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8));
        // Escreve UTF-8 BOM para o Excel abrir com acentuação correta
        writer.write('\ufeff');

        writer.write("RELATÓRIO DE PRESTAÇÃO DE CONTAS - AWS STUDENT BUILDER GROUP");
        writer.newLine();
        writer.write("Evento:;" + escapeCsv(relatorio.eventoNome()));
        writer.newLine();
        writer.write("Status:;" + escapeCsv(relatorio.status().name()));
        writer.newLine();
        writer.write("Orçamento Aprovado (BRL):;R$ " + BRL_FORMAT.format(relatorio.totalOrcadoBrl()));
        writer.newLine();
        writer.write("Orçamento Aprovado (USD):;US$ " + USD_FORMAT.format(relatorio.totalOrcadoUsd()));
        writer.newLine();
        writer.write("Total Realizado (BRL):;R$ " + BRL_FORMAT.format(relatorio.totalRealizadoBrl()));
        writer.newLine();
        writer.write("Total Realizado (USD):;US$ " + USD_FORMAT.format(relatorio.totalRealizadoUsd()));
        writer.newLine();
        writer.write("Saldo Restante (BRL):;R$ " + BRL_FORMAT.format(relatorio.saldoRestanteBrl()));
        writer.newLine();
        writer.write("Execução Orçamentária:;" + String.format(Locale.US, "%.2f", relatorio.percentualExecucao()) + "%");
        writer.newLine();
        writer.newLine();

        // Cabeçalho da tabela de lançamentos
        writer.write("Data;Descrição;Fornecedor;Nº Nota Fiscal;Categoria;Valor (BRL);Valor (USD);Forma Pagamento;Status Financeiro;Responsável;Comprovante Anexado");
        writer.newLine();

        for (LancamentoDTO l : relatorio.lancamentos()) {
            writer.write(String.format("%s;%s;%s;%s;%s;R$ %s;US$ %s;%s;%s;%s;%s",
                    l.getData() != null ? l.getData().format(DATE_FORMATTER) : "",
                    escapeCsv(l.getDescricao()),
                    escapeCsv(l.getFornecedor()),
                    escapeCsv(l.getNumeroNotaFiscal() != null ? l.getNumeroNotaFiscal() : ""),
                    escapeCsv(l.getCategoriaNome() != null ? l.getCategoriaNome() : ""),
                    l.getValorBrl() != null ? BRL_FORMAT.format(l.getValorBrl()) : "0,00",
                    l.getValorUsd() != null ? USD_FORMAT.format(l.getValorUsd()) : "0.00",
                    escapeCsv(l.getFormaPagamento() != null ? l.getFormaPagamento() : ""),
                    escapeCsv(l.getStatusNome() != null ? l.getStatusNome() : ""),
                    escapeCsv(l.getResponsavelNome() != null ? l.getResponsavelNome() : ""),
                    l.getAnexoUrl() != null && !l.getAnexoUrl().isBlank() ? "SIM" : "NÃO"
            ));
            writer.newLine();
        }

        writer.newLine();
        writer.write("PARCERIAS E PATROCÍNIOS DO EVENTO");
        writer.newLine();
        writer.write("Parceiro;Tipo;Valor Contrapartida (BRL);Itens Recebidos;Status;Contato");
        writer.newLine();
        for (ParceriaDTO p : relatorio.parcerias()) {
            writer.write(String.format("%s;%s;R$ %s;%s;%s;%s",
                    escapeCsv(p.getParceiro()),
                    escapeCsv(p.getTipo() != null ? p.getTipo().name() : ""),
                    p.getValorContrapartida() != null ? BRL_FORMAT.format(p.getValorContrapartida()) : "0,00",
                    escapeCsv(p.getItensRecebidos() != null ? p.getItensRecebidos() : ""),
                    escapeCsv(p.getStatus() != null ? p.getStatus().name() : ""),
                    escapeCsv(p.getContato() != null ? p.getContato() : "")
            ));
            writer.newLine();
        }

        writer.newLine();
        writer.write("DISTRIBUIÇÃO DE BRINDES (SWAG)");
        writer.newLine();
        writer.write("Item;Qtd Distribuída;Data Distribuição;Observações");
        writer.newLine();
        for (BrindeDTO b : relatorio.brindesUtilizados()) {
            writer.write(String.format("%s;%d;%s;%s",
                    escapeCsv(b.getItem()),
                    b.getQtdDistribuida() != null ? b.getQtdDistribuida() : 0,
                    b.getDataDistribuicao() != null ? b.getDataDistribuicao().format(DATE_FORMATTER) : "",
                    escapeCsv(b.getObservacoes() != null ? b.getObservacoes() : "")
            ));
            writer.newLine();
        }

        writer.flush();
    }

    private void gerarResumoTxtStream(RelatorioEventoDTO relatorio, OutputStream os) throws IOException {
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8));
        writer.write("========================================================================\n");
        writer.write("     AWS STUDENT BUILDER GROUP - RELATÓRIO DE PRESTAÇÃO DE CONTAS      \n");
        writer.write("========================================================================\n\n");
        writer.write("Evento: " + relatorio.eventoNome() + "\n");
        writer.write("Status: " + relatorio.status() + "\n");
        if (relatorio.data() != null) {
            writer.write("Data do Evento: " + relatorio.data().format(DATE_FORMATTER) + "\n");
        }
        writer.write("\n------------------------------------------------------------------------\n");
        writer.write(" BALANÇO FINANCEIRO CONSOLIDADO\n");
        writer.write("------------------------------------------------------------------------\n");
        writer.write(" • Orçamento Total Planejado (BRL): R$ " + BRL_FORMAT.format(relatorio.totalOrcadoBrl()) + "\n");
        writer.write(" • Orçamento Total Planejado (USD): US$ " + USD_FORMAT.format(relatorio.totalOrcadoUsd()) + "\n");
        writer.write(" • Total Realizado / Gasto (BRL):   R$ " + BRL_FORMAT.format(relatorio.totalRealizadoBrl()) + "\n");
        writer.write(" • Total Realizado / Gasto (USD):   US$ " + USD_FORMAT.format(relatorio.totalRealizadoUsd()) + "\n");
        writer.write(" • Saldo Restante (BRL):            R$ " + BRL_FORMAT.format(relatorio.saldoRestanteBrl()) + "\n");
        writer.write(" • Execução Orçamentária:           " + String.format(Locale.US, "%.2f", relatorio.percentualExecucao()) + "%\n");
        writer.write(" • Total de Lançamentos:            " + relatorio.totalLancamentos() + "\n");
        writer.write(" • Comprovantes Anexados:           " + relatorio.totalComprovantesAnexados() + " de " + relatorio.totalLancamentos() + "\n");
        writer.write("\n========================================================================\n");
        writer.write("Gerado automaticamente pelo Sistema de Gestão Financeira AWS SBG.\n");
        writer.flush();
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        String clean = val.replace("\"", "\"\"");
        if (clean.contains(";") || clean.contains("\n") || clean.contains("\r") || clean.contains("\"")) {
            return "\"" + clean + "\"";
        }
        return clean;
    }

    private String sanitizarNome(String nome) {
        if (nome == null) return "arquivo";
        return nome.trim().replaceAll("[^a-zA-Z0-9_-]", "_");
    }
}
