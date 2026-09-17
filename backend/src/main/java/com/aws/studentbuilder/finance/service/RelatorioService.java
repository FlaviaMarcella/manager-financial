package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.*;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.Lancamento;
import com.aws.studentbuilder.finance.entity.LancamentoAnexo;
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
import java.time.LocalDate;
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
    private final PdfRelatorioService pdfRelatorioService;

    public RelatorioService(
            EventoRepository eventoRepository,
            OrcamentoService orcamentoService,
            LancamentoService lancamentoService,
            LancamentoRepository lancamentoRepository,
            ParceriaService parceriaService,
            BrindeService brindeService,
            StorageService storageService,
            PdfRelatorioService pdfRelatorioService
    ) {
        this.eventoRepository = eventoRepository;
        this.orcamentoService = orcamentoService;
        this.lancamentoService = lancamentoService;
        this.lancamentoRepository = lancamentoRepository;
        this.parceriaService = parceriaService;
        this.brindeService = brindeService;
        this.storageService = storageService;
        this.pdfRelatorioService = pdfRelatorioService;
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
                .map(i -> i.getValorOrcadoUsd() != null ? i.getValorOrcadoUsd() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOrcadoBrl = itensOrcamento.stream()
                .map(i -> i.getValorOrcadoBrl() != null ? i.getValorOrcadoBrl() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRealizadoBrl = lancamentos.stream()
                .map(l -> l.getValorBrl() != null ? l.getValorBrl() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRealizadoUsd = lancamentos.stream()
                .map(l -> l.getValorUsd() != null ? l.getValorUsd() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoRestanteUsd = totalOrcadoUsd.subtract(totalRealizadoUsd).setScale(2, RoundingMode.HALF_UP);
        BigDecimal saldoRestanteBrl = totalOrcadoBrl.subtract(totalRealizadoBrl).setScale(2, RoundingMode.HALF_UP);

        double percentualExecucao = 0.0;
        if (totalOrcadoUsd.compareTo(BigDecimal.ZERO) > 0) {
            percentualExecucao = totalRealizadoUsd.divide(totalOrcadoUsd, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        } else if (totalOrcadoBrl.compareTo(BigDecimal.ZERO) > 0) {
            percentualExecucao = totalRealizadoBrl.divide(totalOrcadoBrl, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        int totalComprovantes = (int) lancamentos.stream()
                .filter(l -> (l.getAnexos() != null && !l.getAnexos().isEmpty()) || (l.getAnexoUrl() != null && !l.getAnexoUrl().isBlank()))
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
    public byte[] gerarRelatorioPdfBytes(Long eventoId) {
        RelatorioEventoDTO relatorio = obterRelatorioEvento(eventoId);
        Specification<Lancamento> spec = (root, query, cb) -> cb.equal(root.get("evento").get("id"), eventoId);
        List<Lancamento> lancamentoEntities = lancamentoRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "data"));
        return pdfRelatorioService.gerarRelatorioCompletoPdf(relatorio, lancamentoEntities);
    }

    @Transactional(readOnly = true)
    public void gerarPacotePrestacaoContasZip(Long eventoId, OutputStream outputStream) throws IOException {
        RelatorioEventoDTO relatorio = obterRelatorioEvento(eventoId);
        Specification<Lancamento> spec = (root, query, cb) -> cb.equal(root.get("evento").get("id"), eventoId);
        List<Lancamento> lancamentoEntities = lancamentoRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "data"));

        try (ZipOutputStream zos = new ZipOutputStream(outputStream, StandardCharsets.UTF_8)) {
            String safeEvento = sanitizarNome(relatorio.eventoNome());

            // 1. Relatório Unificado em PDF (Dossiê com todas as páginas e comprovantes mesclados)
            try {
                byte[] pdfBytes = pdfRelatorioService.gerarRelatorioCompletoPdf(relatorio, lancamentoEntities);
                ZipEntry pdfEntry = new ZipEntry("00_Relatorio_Unificado_Prestacao_Contas_" + safeEvento + ".pdf");
                zos.putNextEntry(pdfEntry);
                zos.write(pdfBytes);
                zos.closeEntry();
            } catch (Exception e) {
                logger.error("Erro ao incluir PDF no pacote ZIP: {}", e.getMessage(), e);
            }

            // 2. Planilha CSV Estruturada e Formatada com Excel BOM
            ZipEntry csvEntry = new ZipEntry("01_Planilha_Financeira_" + safeEvento + ".csv");
            zos.putNextEntry(csvEntry);
            gerarCsvLancamentosStream(relatorio, zos);
            zos.closeEntry();

            // 3. Resumo Executivo em TXT com formatação elegante
            ZipEntry resumoEntry = new ZipEntry("02_Resumo_Executivo_" + safeEvento + ".txt");
            zos.putNextEntry(resumoEntry);
            gerarResumoTxtStream(relatorio, zos);
            zos.closeEntry();

            // 4. Pasta de Comprovantes Individuais Organizada
            int lancamentoIdx = 1;
            for (Lancamento lancamento : lancamentoEntities) {
                String safeFornecedor = sanitizarNome(lancamento.getFornecedor() != null ? lancamento.getFornecedor() : "Fornecedor");
                String nfPrefix = (lancamento.getNumeroNotaFiscal() != null && !lancamento.getNumeroNotaFiscal().isBlank())
                        ? sanitizarNome(lancamento.getNumeroNotaFiscal())
                        : "SEM-NF";
                String valorStr = lancamento.getValorBrl().setScale(2, RoundingMode.HALF_UP).toString().replace(".", "_");

                if (lancamento.getAnexos() != null && !lancamento.getAnexos().isEmpty()) {
                    int anexoSubIdx = 1;
                    for (LancamentoAnexo anexo : lancamento.getAnexos()) {
                        adicionarAnexoAoZip(zos, anexo.getUrl(), anexo.getNomeOriginal(), lancamentoIdx, nfPrefix, safeFornecedor, valorStr, anexoSubIdx++);
                    }
                } else if (lancamento.getAnexoUrl() != null && !lancamento.getAnexoUrl().isBlank()) {
                    adicionarAnexoAoZip(zos, lancamento.getAnexoUrl(), lancamento.getAnexoNomeOriginal(), lancamentoIdx, nfPrefix, safeFornecedor, valorStr, 1);
                }
                lancamentoIdx++;
            }
            zos.finish();
        }
    }

    private void adicionarAnexoAoZip(ZipOutputStream zos, String fileUrl, String originalName, int lancIdx, String nf, String fornecedor, String valorStr, int anexoSubIdx) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        try {
            Resource resource = storageService.loadAsResource(fileUrl);
            if (resource.exists() && resource.isReadable()) {
                String safeOriginal = originalName != null && !originalName.isBlank() ? originalName : "comprovante";
                String ext = "";
                int dotIdx = safeOriginal.lastIndexOf('.');
                if (dotIdx > 0) ext = safeOriginal.substring(dotIdx);

                String zipPath = String.format("comprovantes/%02d_%s_%s_R$%s_anexo%d%s",
                        lancIdx,
                        nf,
                        fornecedor,
                        valorStr,
                        anexoSubIdx,
                        ext
                );

                ZipEntry attachmentEntry = new ZipEntry(zipPath);
                zos.putNextEntry(attachmentEntry);
                try (InputStream in = resource.getInputStream()) {
                    in.transferTo(zos);
                }
                zos.closeEntry();
            }
        } catch (Exception e) {
            logger.error("Erro ao incluir anexo {} no ZIP: {}", originalName, e.getMessage());
        }
    }

    public byte[] gerarCsvBytes(Long eventoId) throws IOException {
        RelatorioEventoDTO relatorio = obterRelatorioEvento(eventoId);
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        gerarCsvLancamentosStream(relatorio, baos);
        return baos.toByteArray();
    }

    private void gerarCsvLancamentosStream(RelatorioEventoDTO r, OutputStream os) throws IOException {
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8));
        writer.write('\ufeff');

        writer.write("====================================================================================================");
        writer.newLine();
        writer.write("AWS STUDENT BUILDER GROUP -- RELATORIO FINANCEIRO CONSOLIDADO");
        writer.newLine();
        writer.write("====================================================================================================");
        writer.newLine();
        writer.write("Evento:;" + escapeCsv(r.eventoNome()));
        writer.newLine();
        writer.write("Data do Evento:;" + (r.data() != null ? r.data().format(DATE_FORMATTER) : "N/D"));
        writer.newLine();
        writer.write("Status do Evento:;" + escapeCsv(r.status().name()));
        writer.newLine();
        writer.write("Data de Emissao:;" + LocalDate.now().format(DATE_FORMATTER));
        writer.newLine();
        writer.newLine();

        // BALANÇO FINANCEIRO
        writer.write("--- BALANCO FINANCEIRO EXECUTIVO ---");
        writer.newLine();
        writer.write("Orcamento Aprovado (BRL):;R$ " + BRL_FORMAT.format(r.totalOrcadoBrl()));
        writer.newLine();
        writer.write("Orcamento Aprovado (USD):;US$ " + USD_FORMAT.format(r.totalOrcadoUsd()));
        writer.newLine();
        writer.write("Total Realizado / Gasto (BRL):;R$ " + BRL_FORMAT.format(r.totalRealizadoBrl()));
        writer.newLine();
        writer.write("Total Realizado / Gasto (USD):;US$ " + USD_FORMAT.format(r.totalRealizadoUsd()));
        writer.newLine();
        writer.write("Saldo Restante (BRL):;R$ " + BRL_FORMAT.format(r.saldoRestanteBrl()));
        writer.newLine();
        writer.write("Saldo Restante (USD):;US$ " + USD_FORMAT.format(r.saldoRestanteUsd()));
        writer.newLine();
        writer.write("Execucao Orcamentaria:;" + String.format(Locale.US, "%.2f", r.percentualExecucao()) + "%");
        writer.newLine();
        writer.write("Total de Lancamentos:;" + r.totalLancamentos());
        writer.newLine();
        writer.write("Comprovantes Anexados:;" + r.totalComprovantesAnexados() + " de " + r.totalLancamentos());
        writer.newLine();
        writer.newLine();

        // TABELA 1: ORÇAMENTO POR CATEGORIA
        writer.write("--- 1. PLANEJAMENTO ORCAMENTARIO POR CATEGORIA ---");
        writer.newLine();
        writer.write("Categoria;Orcado (USD);Taxa Cambio Usada;Orcado (BRL);Gasto Realizado (BRL);Saldo Categoria (BRL)");
        writer.newLine();
        for (ItemOrcamentoDTO item : r.itensOrcamento()) {
            writer.write(String.format("%s;US$ %s;R$ %s;R$ %s;R$ %s;R$ %s",
                    escapeCsv(item.getCategoriaNome()),
                    USD_FORMAT.format(item.getValorOrcadoUsd() != null ? item.getValorOrcadoUsd() : BigDecimal.ZERO),
                    item.getTaxaCambioUsada() != null ? item.getTaxaCambioUsada().setScale(4, RoundingMode.HALF_UP) : "5.5000",
                    BRL_FORMAT.format(item.getValorOrcadoBrl() != null ? item.getValorOrcadoBrl() : BigDecimal.ZERO),
                    BRL_FORMAT.format(item.getValorRealizadoBrl() != null ? item.getValorRealizadoBrl() : BigDecimal.ZERO),
                    BRL_FORMAT.format(item.getSaldoBrl() != null ? item.getSaldoBrl() : BigDecimal.ZERO)
            ));
            writer.newLine();
        }
        writer.newLine();

        // TABELA 2: LANÇAMENTOS E DESPESAS
        writer.write("--- 2. LANCAMENTOS & DESPESAS REALIZADAS ---");
        writer.newLine();
        writer.write("Data;Descricao;Fornecedor;No Nota Fiscal;Categoria;Valor (BRL);Valor (USD);Taxa Cambio Usada;Forma Pagamento;Status Financeiro;Responsavel;Qtd Comprovantes");
        writer.newLine();
        for (LancamentoDTO l : r.lancamentos()) {
            int qtdAnexos = (l.getAnexos() != null && !l.getAnexos().isEmpty()) ? l.getAnexos().size() : (l.getAnexoUrl() != null ? 1 : 0);
            writer.write(String.format("%s;%s;%s;%s;%s;R$ %s;US$ %s;R$ %s;%s;%s;%s;%d",
                    l.getData() != null ? l.getData().format(DATE_FORMATTER) : "",
                    escapeCsv(l.getDescricao()),
                    escapeCsv(l.getFornecedor()),
                    escapeCsv(l.getNumeroNotaFiscal() != null ? l.getNumeroNotaFiscal() : "--"),
                    escapeCsv(l.getCategoriaNome() != null ? l.getCategoriaNome() : ""),
                    l.getValorBrl() != null ? BRL_FORMAT.format(l.getValorBrl()) : "0,00",
                    l.getValorUsd() != null ? USD_FORMAT.format(l.getValorUsd()) : "0.00",
                    l.getTaxaCambioUsada() != null ? l.getTaxaCambioUsada().setScale(4, RoundingMode.HALF_UP) : "5.5000",
                    escapeCsv(l.getFormaPagamento() != null ? l.getFormaPagamento() : ""),
                    escapeCsv(l.getStatusNome() != null ? l.getStatusNome() : ""),
                    escapeCsv(l.getResponsavelNome() != null ? l.getResponsavelNome() : ""),
                    qtdAnexos
            ));
            writer.newLine();
        }
        writer.newLine();

        // TABELA 3: PARCERIAS
        if (r.parcerias() != null && !r.parcerias().isEmpty()) {
            writer.write("--- 3. PARCERIAS E PATROCINIOS DO EVENTO ---");
            writer.newLine();
            writer.write("Parceiro;Tipo;Valor Contrapartida (BRL);Itens Recebidos;Status;Contato");
            writer.newLine();
            for (ParceriaDTO p : r.parcerias()) {
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
        }

        // TABELA 4: BRINDES
        if (r.brindesUtilizados() != null && !r.brindesUtilizados().isEmpty()) {
            writer.write("--- 4. DISTRIBUICAO DE BRINDES (SWAG) ---");
            writer.newLine();
            writer.write("Item;Qtd Distribuida;Data Distribuicao;Observacoes");
            writer.newLine();
            for (BrindeDTO b : r.brindesUtilizados()) {
                writer.write(String.format("%s;%d;%s;%s",
                        escapeCsv(b.getItem()),
                        b.getQtdDistribuida() != null ? b.getQtdDistribuida() : 0,
                        b.getDataDistribuicao() != null ? b.getDataDistribuicao().format(DATE_FORMATTER) : "",
                        escapeCsv(b.getObservacoes() != null ? b.getObservacoes() : "")
                ));
                writer.newLine();
            }
        }

        writer.flush();
    }

    private void gerarResumoTxtStream(RelatorioEventoDTO r, OutputStream os) throws IOException {
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8));
        writer.write("========================================================================================\n");
        writer.write("                  AWS STUDENT BUILDER GROUP -- PRESTACAO DE CONTAS                      \n");
        writer.write("========================================================================================\n\n");
        writer.write("EVENTO: " + r.eventoNome() + "\n");
        writer.write("STATUS: " + r.status() + "\n");
        if (r.data() != null) {
            writer.write("DATA DO EVENTO: " + r.data().format(DATE_FORMATTER) + "\n");
        }
        writer.write("DATA DE EMISSAO: " + LocalDate.now().format(DATE_FORMATTER) + "\n");
        writer.write("\n----------------------------------------------------------------------------------------\n");
        writer.write(" BALANCO FINANCEIRO CONSOLIDADO\n");
        writer.write("----------------------------------------------------------------------------------------\n");
        writer.write(String.format(" * Orcamento Aprovado (BRL):       R$ %15s\n", BRL_FORMAT.format(r.totalOrcadoBrl())));
        writer.write(String.format(" * Orcamento Aprovado (USD):      US$ %15s\n", USD_FORMAT.format(r.totalOrcadoUsd())));
        writer.write(String.format(" * Total Realizado / Gasto (BRL): R$ %15s\n", BRL_FORMAT.format(r.totalRealizadoBrl())));
        writer.write(String.format(" * Total Realizado / Gasto (USD):US$ %15s\n", USD_FORMAT.format(r.totalRealizadoUsd())));
        writer.write(String.format(" * Saldo Restante (BRL):          R$ %15s\n", BRL_FORMAT.format(r.saldoRestanteBrl())));
        writer.write(String.format(" * Saldo Restante (USD):         US$ %15s\n", USD_FORMAT.format(r.saldoRestanteUsd())));
        writer.write(String.format(" * Execucao Orcamentaria:            %14.2f %%\n", r.percentualExecucao()));
        writer.write(String.format(" * Total de Lancamentos:             %14d\n", r.totalLancamentos()));
        writer.write(String.format(" * Comprovantes Anexados:            %14s\n", r.totalComprovantesAnexados() + " de " + r.totalLancamentos()));
        writer.write("\n----------------------------------------------------------------------------------------\n");
        writer.write(" RESUMO POR CATEGORIA DE DESPESA\n");
        writer.write("----------------------------------------------------------------------------------------\n");
        for (ItemOrcamentoDTO item : r.itensOrcamento()) {
            writer.write(String.format(" - %-25s | Orcado: R$ %10s | Gasto: R$ %10s | Saldo: R$ %10s\n",
                    item.getCategoriaNome(),
                    BRL_FORMAT.format(item.getValorOrcadoBrl() != null ? item.getValorOrcadoBrl() : BigDecimal.ZERO),
                    BRL_FORMAT.format(item.getValorRealizadoBrl() != null ? item.getValorRealizadoBrl() : BigDecimal.ZERO),
                    BRL_FORMAT.format(item.getSaldoBrl() != null ? item.getSaldoBrl() : BigDecimal.ZERO)
            ));
        }
        writer.write("\n========================================================================================\n");
        writer.write("Gerado automaticamente pelo Sistema de Gestao Financeira AWS SBG.\n");
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
