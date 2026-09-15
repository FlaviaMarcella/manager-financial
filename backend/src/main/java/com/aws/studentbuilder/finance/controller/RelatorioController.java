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
@Tag(name = "Relatórios & Prestação de Contas", description = "Endpoints para geração de relatórios consolidados e pacotes de prestação de contas com comprovantes")
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

    @GetMapping(value = "/eventos/{eventoId}/zip", produces = "application/zip")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Baixar pacote completo de prestação de contas (.ZIP) contendo relatório CSV e comprovantes anexados")
    public ResponseEntity<StreamingResponseBody> downloadPacoteZip(@PathVariable Long eventoId) {
        RelatorioEventoDTO relatorio = relatorioService.obterRelatorioEvento(eventoId);
        String filename = "prestacao-contas-evento-" + eventoId + ".zip";

        StreamingResponseBody responseBody = outputStream -> {
            try {
                relatorioService.gerarPacotePrestacaoContasZip(eventoId, outputStream);
            } catch (Exception e) {
                throw new IOException("Erro ao gerar arquivo ZIP da prestação de contas", e);
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(responseBody);
    }

    @GetMapping(value = "/eventos/{eventoId}/csv", produces = "text/csv; charset=UTF-8")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Baixar relatório financeiro do evento em formato CSV")
    public ResponseEntity<byte[]> downloadCsv(@PathVariable Long eventoId) throws IOException {
        byte[] csvBytes = relatorioService.gerarCsvBytes(eventoId);
        String filename = "relatorio-financeiro-evento-" + eventoId + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}
