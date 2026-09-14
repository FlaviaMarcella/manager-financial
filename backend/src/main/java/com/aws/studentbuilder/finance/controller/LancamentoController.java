package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.LancamentoDTO;
import com.aws.studentbuilder.finance.dto.LancamentoRequest;
import com.aws.studentbuilder.finance.service.LancamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lancamentos")
@Tag(name = "Lançamentos / Notas Fiscais", description = "CRUD de lançamentos e anexos de notas fiscais")
public class LancamentoController {

    private final LancamentoService lancamentoService;

    public LancamentoController(LancamentoService lancamentoService) {
        this.lancamentoService = lancamentoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Listar e filtrar lançamentos financeiros")
    public ResponseEntity<List<LancamentoDTO>> listar(
            @RequestParam(required = false) Long eventoId,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) String busca
    ) {
        return ResponseEntity.ok(lancamentoService.filtrar(eventoId, categoriaId, statusId, dataInicio, dataFim, busca));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Buscar lançamento por ID")
    public ResponseEntity<LancamentoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(lancamentoService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar novo lançamento financeiro (apenas ADMIN)")
    public ResponseEntity<LancamentoDTO> criar(@Valid @RequestBody LancamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lancamentoService.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar lançamento financeiro (apenas ADMIN)")
    public ResponseEntity<LancamentoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody LancamentoRequest request) {
        return ResponseEntity.ok(lancamentoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar lançamento (apenas ADMIN)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        lancamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/anexo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload de comprovante/anexo para o lançamento")
    public ResponseEntity<LancamentoDTO> uploadAnexo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(lancamentoService.vincularAnexo(id, file));
    }

    @DeleteMapping("/{id}/anexo")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remover anexo do lançamento")
    public ResponseEntity<LancamentoDTO> removerAnexo(@PathVariable Long id) {
        return ResponseEntity.ok(lancamentoService.removerAnexo(id));
    }

    @GetMapping("/{id}/anexo")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Download ou visualização do anexo")
    public ResponseEntity<Resource> downloadAnexo(@PathVariable Long id) {
        Resource resource = lancamentoService.carregarAnexo(id);
        LancamentoDTO dto = lancamentoService.buscarPorId(id);

        String contentType = "application/octet-stream";
        if (dto.getAnexoNomeOriginal() != null) {
            String lower = dto.getAnexoNomeOriginal().toLowerCase();
            if (lower.endsWith(".pdf")) contentType = "application/pdf";
            else if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (dto.getAnexoNomeOriginal() != null ? dto.getAnexoNomeOriginal() : "comprovante") + "\"")
                .body(resource);
    }
}
