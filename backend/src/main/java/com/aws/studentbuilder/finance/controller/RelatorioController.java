package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.RelatorioEventoDTO;
import com.aws.studentbuilder.finance.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;

@RestController
@RequestMapping("/api/relatorios")
@Tag(name = "Relatórios & Prestação de Contas", description = "Endpoints para geração de relatórios consolidados, PDF unificado com notas fiscais e pacotes ZIP")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/eventos/{eventoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Obter dados consolidados do relatório financeiro do evento")
    public ResponseEntity<RelatorioEventoDTO> obterRelatorioEvento(@PathVariable Long eventoId) {
        return ResponseEntity.ok(relatorioService.obterRelatorioEvento(eventoId));
    }

    @GetMapping(value = "/eventos/{eventoId}/pdf", produces = "application/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Baixar relatório financeiro unificado em PDF contendo páginas de prestação e todos os anexos de notas fiscais mesclados")
    public ResponseEntity<byte[]> downloadRelatorioPdf(@PathVariable Long eventoId) {
        byte[] pdfBytes = relatorioService.gerarRelatorioPdfBytes(eventoId);
        String filename = "relatorio-prestacao-contas-evento-" + eventoId + ".pdf";
        String disposition = "inline; filename=\"" + filename + "\"";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping(value = "/eventos/{eventoId}/zip", produces = "application/zip")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Baixar pacote completo de prestação de contas (.ZIP) contendo relatório PDF unificado, CSV e pasta de comprovantes")
    public ResponseEntity<StreamingResponseBody> downloadPacoteZip(@PathVariable Long eventoId) {
        String filename = "prestacao-contas-evento-" + eventoId + ".zip";
        String disposition = "attachment; filename=\"" + filename + "\"";

        StreamingResponseBody responseBody = outputStream -> {
            try {
                relatorioService.gerarPacotePrestacaoContasZip(eventoId, outputStream);
            } catch (Exception e) {
                throw new IOException("Erro ao gerar arquivo ZIP da prestação de contas", e);
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(responseBody);
    }

    @GetMapping(value = "/eventos/{eventoId}/csv", produces = "text/csv; charset=UTF-8")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Baixar relatório financeiro do evento em formato CSV estruturado para Excel")
    public ResponseEntity<byte[]> downloadCsv(@PathVariable Long eventoId) throws IOException {
        byte[] csvBytes = relatorioService.gerarCsvBytes(eventoId);
        String filename = "relatorio-financeiro-evento-" + eventoId + ".csv";
        String disposition = "attachment; filename=\"" + filename + "\"";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}
