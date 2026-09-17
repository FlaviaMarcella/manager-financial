package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.*;
import com.aws.studentbuilder.finance.entity.Lancamento;
import com.aws.studentbuilder.finance.entity.LancamentoAnexo;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class PdfRelatorioService {

    private static final Logger logger = LoggerFactory.getLogger(PdfRelatorioService.class);

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DecimalFormat BRL_FORMAT = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));
    private static final DecimalFormat USD_FORMAT = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(Locale.US));

    // Cores Oficiais AWS Student Builder
    private static final Color COLOR_NAVY = new Color(21, 29, 37);       // #151D25
    private static final Color COLOR_NAVY_LIGHT = new Color(30, 41, 54);
    private static final Color COLOR_AMBER = new Color(255, 153, 0);     // #FF9900 AWS Amber
    private static final Color COLOR_AMBER_DARK = new Color(180, 83, 9); // #B45309
    private static final Color COLOR_MINT = new Color(0, 135, 76);       // #00874C
    private static final Color COLOR_MINT_BG = new Color(209, 250, 229); // #D1FAE5
    private static final Color COLOR_DANGER = new Color(220, 38, 38);    // #DC2626
    private static final Color COLOR_BORDER = new Color(226, 232, 240);  // #E2E8F0
    private static final Color COLOR_ROW_ALT = new Color(248, 250, 252); // #F8FAFC
    private static final Color COLOR_TEXT_MUTED = new Color(100, 116, 139); // #64748B
    private static final Color COLOR_SECTION_BG = new Color(241, 245, 249); // #F1F5F9

    private final StorageService storageService;

    public PdfRelatorioService(StorageService storageService) {
        this.storageService = storageService;
    }

    public byte[] gerarRelatorioCompletoPdf(RelatorioEventoDTO relatorio, List<Lancamento> lancamentos) {
        try {
            // 1. Gera o documento principal do relatório estruturado
            byte[] relatorioPrincipalBytes = gerarRelatorioBasePdf(relatorio);

            // 2. Faz o merge dos anexos (imagens convertidas em páginas PDF e PDFs externos mesclados)
            return fundirRelatorioComAnexos(relatorioPrincipalBytes, lancamentos, relatorio.eventoNome());
        } catch (Exception e) {
            logger.error("Erro ao gerar relatório unificado em PDF para evento {}: {}", relatorio.eventoId(), e.getMessage(), e);
            throw new RuntimeException("Falha na geração do dossiê em PDF: " + e.getMessage(), e);
        }
    }

    private byte[] gerarRelatorioBasePdf(RelatorioEventoDTO r) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 28, 28, 42, 36);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        // Adiciona cabeçalho e rodapé com numeração de páginas
        PdfFooterPageEvent event = new PdfFooterPageEvent(r.eventoNome());
        writer.setPageEvent(event);

        document.open();

        // --- BANNER DE TOPO ---
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{70, 30});
        headerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        // Bloco Esquerdo: Título & Evento
        PdfPCell leftHeader = new PdfPCell();
        leftHeader.setBorder(Rectangle.NO_BORDER);
        leftHeader.setPaddingBottom(8);

        Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, COLOR_AMBER);
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, COLOR_NAVY);
        Font eventFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, COLOR_NAVY_LIGHT);
        Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 8, COLOR_TEXT_MUTED);

        leftHeader.addElement(new Paragraph("AWS STUDENT BUILDER GROUP", brandFont));
        leftHeader.addElement(new Paragraph("Dossiê Financeiro & Prestação de Contas", titleFont));
        leftHeader.addElement(new Paragraph("Evento: " + r.eventoNome(), eventFont));
        headerTable.addCell(leftHeader);

        // Bloco Direito: Metadados
        PdfPCell rightHeader = new PdfPCell();
        rightHeader.setBorder(Rectangle.NO_BORDER);
        rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rightHeader.setPaddingBottom(8);

        Paragraph pData = new Paragraph("Data Evento: " + (r.data() != null ? r.data().format(DATE_FORMAT) : "N/D"), subFont);
        pData.setAlignment(Element.ALIGN_RIGHT);
        Paragraph pStatus = new Paragraph("Status: " + r.status().name(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COLOR_MINT));
        pStatus.setAlignment(Element.ALIGN_RIGHT);
        Paragraph pEmitido = new Paragraph("Emitido em: " + LocalDate.now().format(DATE_FORMAT), subFont);
        pEmitido.setAlignment(Element.ALIGN_RIGHT);

        rightHeader.addElement(pData);
        rightHeader.addElement(pStatus);
        rightHeader.addElement(pEmitido);
        headerTable.addCell(rightHeader);

        document.add(headerTable);

        // Linha divisória com destaque âmbar
        PdfPTable hr = new PdfPTable(1);
        hr.setWidthPercentage(100);
        PdfPCell hrCell = new PdfPCell();
        hrCell.setFixedHeight(2);
        hrCell.setBackgroundColor(COLOR_AMBER);
        hrCell.setBorder(Rectangle.NO_BORDER);
        hr.addCell(hrCell);
        hr.setSpacingAfter(10);
        document.add(hr);

        // --- CARDS DE SUMÁRIO EXECUTIVO (KPIs) ---
        PdfPTable kpiTable = new PdfPTable(4);
        kpiTable.setWidthPercentage(100);
        kpiTable.setWidths(new float[]{25, 25, 25, 25});
        kpiTable.setSpacingAfter(12);

        adicionarKpiCard(kpiTable, "ORÇAMENTO APROVADO", "R$ " + BRL_FORMAT.format(r.totalOrcadoBrl()), "US$ " + USD_FORMAT.format(r.totalOrcadoUsd()), COLOR_NAVY);
        adicionarKpiCard(kpiTable, "TOTAL REALIZADO", "R$ " + BRL_FORMAT.format(r.totalRealizadoBrl()), "US$ " + USD_FORMAT.format(r.totalRealizadoUsd()), COLOR_AMBER_DARK);
        
        Color saldoColor = r.saldoRestanteBrl().compareTo(BigDecimal.ZERO) >= 0 ? COLOR_MINT : COLOR_DANGER;
        adicionarKpiCard(kpiTable, "SALDO REMANESCENTE", "R$ " + BRL_FORMAT.format(r.saldoRestanteBrl()), "US$ " + USD_FORMAT.format(r.saldoRestanteUsd()), saldoColor);
        
        String comprovantesInfo = r.totalComprovantesAnexados() + " de " + r.totalLancamentos() + " anexados";
        adicionarKpiCard(kpiTable, "EXECUÇÃO / COMPROVANTES", String.format(Locale.US, "%.1f%%", r.percentualExecucao()), comprovantesInfo, COLOR_NAVY_LIGHT);

        document.add(kpiTable);

        // --- SEÇÃO 1: DOTAÇÃO ORÇAMENTÁRIA POR CATEGORIA ---
        adicionarSecaoTitulo(document, "1. Dotação Orçamentária por Categoria");

        PdfPTable orcTable = new PdfPTable(6);
        orcTable.setWidthPercentage(100);
        orcTable.setWidths(new float[]{28, 14, 14, 15, 15, 14});
        orcTable.setSpacingAfter(12);

        adicionarHeaderTabela(orcTable, new String[]{"Categoria", "Orçado (USD)", "Câmbio", "Orçado (BRL)", "Gasto (BRL)", "Saldo (BRL)"});

        boolean alt = false;
        for (ItemOrcamentoDTO item : r.itensOrcamento()) {
            Color bg = alt ? COLOR_ROW_ALT : Color.WHITE;
            alt = !alt;

            adicionarCelula(orcTable, item.getCategoriaNome(), FontFactory.HELVETICA_BOLD, 8, COLOR_NAVY, bg, Element.ALIGN_LEFT);
            adicionarCelula(orcTable, "US$ " + USD_FORMAT.format(item.getValorOrcadoUsd()), FontFactory.HELVETICA, 8, COLOR_NAVY, bg, Element.ALIGN_RIGHT);
            adicionarCelula(orcTable, "R$ " + (item.getTaxaCambioUsada() != null ? item.getTaxaCambioUsada().setScale(4, RoundingMode.HALF_UP).toString() : "5.5000"), FontFactory.HELVETICA, 8, COLOR_TEXT_MUTED, bg, Element.ALIGN_RIGHT);
            adicionarCelula(orcTable, "R$ " + BRL_FORMAT.format(item.getValorOrcadoBrl()), FontFactory.HELVETICA, 8, COLOR_NAVY, bg, Element.ALIGN_RIGHT);
            adicionarCelula(orcTable, "R$ " + BRL_FORMAT.format(item.getValorRealizadoBrl() != null ? item.getValorRealizadoBrl() : BigDecimal.ZERO), FontFactory.HELVETICA, 8, COLOR_AMBER_DARK, bg, Element.ALIGN_RIGHT);
            
            BigDecimal saldo = item.getSaldoBrl() != null ? item.getSaldoBrl() : BigDecimal.ZERO;
            Color saldoTxt = saldo.compareTo(BigDecimal.ZERO) >= 0 ? COLOR_MINT : COLOR_DANGER;
            adicionarCelula(orcTable, "R$ " + BRL_FORMAT.format(saldo), FontFactory.HELVETICA_BOLD, 8, saldoTxt, bg, Element.ALIGN_RIGHT);
        }
        if (r.itensOrcamento().isEmpty()) {
            adicionarLinhaVazia(orcTable, 6, "Nenhum orçamento cadastrado para este evento.");
        }
        document.add(orcTable);

        // --- SEÇÃO 2: LANÇAMENTOS E DESPESAS REALIZADAS ---
        adicionarSecaoTitulo(document, "2. Lançamentos & Despesas Realizadas (" + r.lancamentos().size() + " registros)");

        PdfPTable lancTable = new PdfPTable(8);
        lancTable.setWidthPercentage(100);
        lancTable.setWidths(new float[]{11, 23, 17, 12, 13, 11, 10, 8});
        lancTable.setSpacingAfter(12);

        adicionarHeaderTabela(lancTable, new String[]{"Data", "Descrição", "Fornecedor", "Nº NF", "Valor (BRL)", "Valor (USD)", "Status", "Anexos"});

        alt = false;
        int comprovanteCounter = 1;
        for (LancamentoDTO l : r.lancamentos()) {
            Color bg = alt ? COLOR_ROW_ALT : Color.WHITE;
            alt = !alt;

            String dataStr = l.getData() != null ? l.getData().format(DATE_FORMAT) : "";
            adicionarCelula(lancTable, dataStr, FontFactory.HELVETICA, 7.5f, COLOR_NAVY, bg, Element.ALIGN_CENTER);
            adicionarCelula(lancTable, l.getDescricao(), FontFactory.HELVETICA_BOLD, 7.5f, COLOR_NAVY, bg, Element.ALIGN_LEFT);
            adicionarCelula(lancTable, l.getFornecedor(), FontFactory.HELVETICA, 7.5f, COLOR_NAVY, bg, Element.ALIGN_LEFT);
            adicionarCelula(lancTable, l.getNumeroNotaFiscal() != null && !l.getNumeroNotaFiscal().isBlank() ? l.getNumeroNotaFiscal() : "—", FontFactory.COURIER, 7.5f, COLOR_TEXT_MUTED, bg, Element.ALIGN_CENTER);
            adicionarCelula(lancTable, "R$ " + BRL_FORMAT.format(l.getValorBrl()), FontFactory.HELVETICA_BOLD, 7.5f, COLOR_NAVY, bg, Element.ALIGN_RIGHT);
            adicionarCelula(lancTable, l.getValorUsd() != null ? "US$ " + USD_FORMAT.format(l.getValorUsd()) : "—", FontFactory.HELVETICA, 7.5f, COLOR_TEXT_MUTED, bg, Element.ALIGN_RIGHT);
            adicionarCelula(lancTable, l.getStatusNome() != null ? l.getStatusNome() : "OK", FontFactory.HELVETICA, 7f, COLOR_NAVY, bg, Element.ALIGN_CENTER);
            
            boolean temAnexo = (l.getAnexos() != null && !l.getAnexos().isEmpty()) || (l.getAnexoUrl() != null && !l.getAnexoUrl().isBlank());
            int qtdAnexos = (l.getAnexos() != null && !l.getAnexos().isEmpty()) ? l.getAnexos().size() : (l.getAnexoUrl() != null ? 1 : 0);
            String anexoLabel = temAnexo ? "SIM (" + qtdAnexos + ")" : "NÃO";
            Color anexoCor = temAnexo ? COLOR_MINT : COLOR_DANGER;
            adicionarCelula(lancTable, anexoLabel, FontFactory.HELVETICA_BOLD, 7f, anexoCor, bg, Element.ALIGN_CENTER);
        }
        if (r.lancamentos().isEmpty()) {
            adicionarLinhaVazia(lancTable, 8, "Nenhum lançamento financeiro registrado para este evento.");
        }
        document.add(lancTable);

        // --- SEÇÃO 3: PARCERIAS E PATROCÍNIOS (SE HOUVER) ---
        if (r.parcerias() != null && !r.parcerias().isEmpty()) {
            adicionarSecaoTitulo(document, "3. Parcerias & Patrocínios do Evento");
            PdfPTable parcTable = new PdfPTable(5);
            parcTable.setWidthPercentage(100);
            parcTable.setWidths(new float[]{30, 18, 20, 18, 14});
            parcTable.setSpacingAfter(12);
            adicionarHeaderTabela(parcTable, new String[]{"Parceiro / Empresa", "Tipo", "Valor Contrapartida", "Status", "Contato"});

            alt = false;
            for (ParceriaDTO p : r.parcerias()) {
                Color bg = alt ? COLOR_ROW_ALT : Color.WHITE;
                alt = !alt;
                adicionarCelula(parcTable, p.getParceiro(), FontFactory.HELVETICA_BOLD, 8, COLOR_NAVY, bg, Element.ALIGN_LEFT);
                adicionarCelula(parcTable, p.getTipo() != null ? p.getTipo().name() : "", FontFactory.HELVETICA, 8, COLOR_NAVY, bg, Element.ALIGN_CENTER);
                adicionarCelula(parcTable, p.getValorContrapartida() != null ? "R$ " + BRL_FORMAT.format(p.getValorContrapartida()) : "R$ 0,00", FontFactory.HELVETICA, 8, COLOR_NAVY, bg, Element.ALIGN_RIGHT);
                adicionarCelula(parcTable, p.getStatus() != null ? p.getStatus().name() : "", FontFactory.HELVETICA, 8, COLOR_NAVY, bg, Element.ALIGN_CENTER);
                adicionarCelula(parcTable, p.getContato() != null ? p.getContato() : "—", FontFactory.HELVETICA, 7.5f, COLOR_TEXT_MUTED, bg, Element.ALIGN_LEFT);
            }
            document.add(parcTable);
        }

        // --- SEÇÃO 4: DISTRIBUIÇÃO DE BRINDES (SWAG) (SE HOUVER) ---
        if (r.brindesUtilizados() != null && !r.brindesUtilizados().isEmpty()) {
            adicionarSecaoTitulo(document, "4. Distribuição de Brindes & Swag");
            PdfPTable brindeTable = new PdfPTable(3);
            brindeTable.setWidthPercentage(100);
            brindeTable.setWidths(new float[]{40, 25, 35});
            brindeTable.setSpacingAfter(12);
            adicionarHeaderTabela(brindeTable, new String[]{"Item / Brinde", "Qtd Distribuída", "Observações"});

            alt = false;
            for (BrindeDTO b : r.brindesUtilizados()) {
                Color bg = alt ? COLOR_ROW_ALT : Color.WHITE;
                alt = !alt;
                adicionarCelula(brindeTable, b.getItem(), FontFactory.HELVETICA_BOLD, 8, COLOR_NAVY, bg, Element.ALIGN_LEFT);
                adicionarCelula(brindeTable, b.getQtdDistribuida() + " unidades", FontFactory.HELVETICA, 8, COLOR_MINT, bg, Element.ALIGN_CENTER);
                adicionarCelula(brindeTable, b.getObservacoes() != null ? b.getObservacoes() : "—", FontFactory.HELVETICA, 7.5f, COLOR_TEXT_MUTED, bg, Element.ALIGN_LEFT);
            }
            document.add(brindeTable);
        }

        document.close();
        return baos.toByteArray();
    }

    private byte[] fundirRelatorioComAnexos(byte[] relatorioBasePdf, List<Lancamento> lancamentos, String eventoNome) throws Exception {
        ByteArrayOutputStream outputBaos = new ByteArrayOutputStream();
        Document masterDoc = new Document();
        PdfCopy copy = new PdfCopy(masterDoc, outputBaos);
        masterDoc.open();

        // 1. Copia todas as páginas do relatório base
        PdfReader baseReader = new PdfReader(relatorioBasePdf);
        int totalBasePages = baseReader.getNumberOfPages();
        for (int i = 1; i <= totalBasePages; i++) {
            copy.addPage(copy.getImportedPage(baseReader, i));
        }
        baseReader.close();

        // 2. Anexa comprovantes e notas fiscais de cada lançamento
        int comprovanteIndex = 1;
        for (Lancamento l : lancamentos) {
            // Se possui múltiplos anexos na lista lancamento_anexos
            if (l.getAnexos() != null && !l.getAnexos().isEmpty()) {
                for (LancamentoAnexo anexo : l.getAnexos()) {
                    anexarArquivoAoPdf(copy, anexo.getUrl(), anexo.getNomeOriginal(), l, comprovanteIndex++);
                }
            } else if (l.getAnexoUrl() != null && !l.getAnexoUrl().isBlank()) {
                // Legado: anexo único
                anexarArquivoAoPdf(copy, l.getAnexoUrl(), l.getAnexoNomeOriginal(), l, comprovanteIndex++);
            }
        }

        masterDoc.close();
        return outputBaos.toByteArray();
    }

    private void anexarArquivoAoPdf(PdfCopy copy, String fileUrl, String originalName, Lancamento l, int index) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        try {
            Resource resource = storageService.loadAsResource(fileUrl);
            if (!resource.exists() || !resource.isReadable()) {
                logger.warn("Anexo não encontrado para mesclagem no PDF: {}", fileUrl);
                return;
            }

            String lower = (originalName != null ? originalName : fileUrl).toLowerCase();

            if (lower.endsWith(".pdf")) {
                // Caso seja PDF, mescla todas as páginas do PDF
                try (InputStream in = resource.getInputStream()) {
                    PdfReader pdfReader = new PdfReader(in);
                    int nPages = pdfReader.getNumberOfPages();
                    for (int p = 1; p <= nPages; p++) {
                        copy.addPage(copy.getImportedPage(pdfReader, p));
                    }
                    pdfReader.close();
                }
            } else if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif")) {
                // Caso seja Imagem, gera uma página de anexo elegante com cabeçalho explicativo e a imagem centralizada
                byte[] imgPagePdf = criarPaginaComprovanteImagem(resource, originalName, l, index);
                if (imgPagePdf != null) {
                    PdfReader imgReader = new PdfReader(imgPagePdf);
                    for (int p = 1; p <= imgReader.getNumberOfPages(); p++) {
                        copy.addPage(copy.getImportedPage(imgReader, p));
                    }
                    imgReader.close();
                }
            }
        } catch (Exception e) {
            logger.error("Erro ao incluir anexo {} no dossiê PDF: {}", originalName, e.getMessage());
        }
    }

    private byte[] criarPaginaComprovanteImagem(Resource resource, String originalName, Lancamento l, int index) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 28, 28, 30, 30);
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            doc.open();

            // Header do Comprovante
            PdfPTable header = new PdfPTable(1);
            header.setWidthPercentage(100);
            PdfPCell cell = new PdfPCell();
            cell.setBackgroundColor(COLOR_SECTION_BG);
            cell.setBorderColor(COLOR_BORDER);
            cell.setPadding(8);

            Font fTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, COLOR_NAVY);
            Font fSub = FontFactory.getFont(FontFactory.HELVETICA, 8, COLOR_NAVY_LIGHT);
            Font fMuted = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, COLOR_TEXT_MUTED);

            cell.addElement(new Paragraph(String.format("ANEXO DE COMPROVANTE #%02d — %s", index, originalName != null ? originalName : "Comprovante"), fTitle));
            cell.addElement(new Paragraph(String.format("Lançamento: %s | Fornecedor: %s | Valor: R$ %s (US$ %s)",
                    l.getDescricao(),
                    l.getFornecedor(),
                    BRL_FORMAT.format(l.getValorBrl()),
                    USD_FORMAT.format(l.getValorUsd() != null ? l.getValorUsd() : BigDecimal.ZERO)
            ), fSub));
            cell.addElement(new Paragraph(String.format("Data do Pagamento: %s | Nº NF: %s",
                    l.getData() != null ? l.getData().format(DATE_FORMAT) : "N/D",
                    l.getNumeroNotaFiscal() != null && !l.getNumeroNotaFiscal().isBlank() ? l.getNumeroNotaFiscal() : "Não informada"
            ), fMuted));

            header.addCell(cell);
            header.setSpacingAfter(10);
            doc.add(header);

            // Carrega e escala a imagem proporcionalmente
            byte[] imgBytes;
            try (InputStream in = resource.getInputStream()) {
                imgBytes = in.readAllBytes();
            }
            Image image = Image.getInstance(imgBytes);
            image.setAlignment(Element.ALIGN_CENTER);

            float maxWidth = PageSize.A4.getWidth() - 56;  // Margens 28 de cada lado
            float maxHeight = PageSize.A4.getHeight() - 110; // Espaço restante da página
            image.scaleToFit(maxWidth, maxHeight);

            doc.add(image);
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            logger.error("Erro ao converter imagem em página PDF: {}", e.getMessage());
            return null;
        }
    }

    // --- MÉTODOS AUXILIARES DE FORMATAÇÃO ---

    private void adicionarKpiCard(PdfPTable table, String label, String value, String subvalue, Color valColor) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(COLOR_SECTION_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(6);

        Font fLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 6.5f, COLOR_TEXT_MUTED);
        Font fValue = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, valColor);
        Font fSub = FontFactory.getFont(FontFactory.HELVETICA, 7, COLOR_TEXT_MUTED);

        cell.addElement(new Paragraph(label, fLabel));
        cell.addElement(new Paragraph(value, fValue));
        cell.addElement(new Paragraph(subvalue, fSub));

        table.addCell(cell);
    }

    private void adicionarSecaoTitulo(Document doc, String titulo) throws DocumentException {
        Font f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, COLOR_NAVY);
        Paragraph p = new Paragraph(titulo, f);
        p.setSpacingBefore(6);
        p.setSpacingAfter(4);
        doc.add(p);
    }

    private void adicionarHeaderTabela(PdfPTable table, String[] headers) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, Color.WHITE);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, font));
            cell.setBackgroundColor(COLOR_NAVY);
            cell.setBorderColor(COLOR_NAVY_LIGHT);
            cell.setPadding(4.5f);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            table.addCell(cell);
        }
    }

    private void adicionarCelula(PdfPTable table, String text, String fontName, float fontSize, Color textColor, Color bgColor, int align) {
        Font font = FontFactory.getFont(fontName, fontSize, textColor);
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setBackgroundColor(bgColor);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(4f);
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(cell);
    }

    private void adicionarLinhaVazia(PdfPTable table, int colspan, String msg) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, COLOR_TEXT_MUTED);
        PdfPCell cell = new PdfPCell(new Phrase(msg, font));
        cell.setColspan(colspan);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(COLOR_ROW_ALT);
        cell.setBorderColor(COLOR_BORDER);
        table.addCell(cell);
    }

    // --- EVENTO DE RODAPÉ & NUMERAÇÃO ---
    private static class PdfFooterPageEvent extends PdfPageEventHelper {
        private final String eventoNome;
        private PdfTemplate totalPagesTemplate;
        private BaseFont baseFont;

        public PdfFooterPageEvent(String eventoNome) {
            this.eventoNome = eventoNome;
        }

        @Override
        public void onOpenDocument(PdfWriter writer, Document document) {
            totalPagesTemplate = writer.getDirectContent().createTemplate(30, 16);
            try {
                baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            } catch (Exception ignored) {}
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            cb.saveState();

            // Rodapé
            String footerText = "AWS Student Builder Group • " + eventoNome + " • Página " + writer.getPageNumber() + " de ";
            float textBase = 18;
            float textSize = baseFont.getWidthPoint(footerText, 7.5f);

            cb.beginText();
            cb.setFontAndSize(baseFont, 7.5f);
            cb.setColorFill(COLOR_TEXT_MUTED);
            cb.setTextMatrix(document.left(), textBase);
            cb.showText(footerText);
            cb.endText();

            cb.addTemplate(totalPagesTemplate, document.left() + textSize, textBase);

            cb.restoreState();
        }

        @Override
        public void onCloseDocument(PdfWriter writer, Document document) {
            totalPagesTemplate.beginText();
            totalPagesTemplate.setFontAndSize(baseFont, 7.5f);
            totalPagesTemplate.setColorFill(COLOR_TEXT_MUTED);
            totalPagesTemplate.showText(String.valueOf(writer.getPageNumber() - 1));
            totalPagesTemplate.endText();
        }
    }
}
