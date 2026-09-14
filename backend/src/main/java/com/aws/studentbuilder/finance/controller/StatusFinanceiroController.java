package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.StatusFinanceiroDTO;
import com.aws.studentbuilder.finance.service.StatusFinanceiroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/status-financeiro")
@Tag(name = "Status Financeiro", description = "CRUD de status de pagamentos/lançamentos")
public class StatusFinanceiroController {

    private final StatusFinanceiroService statusFinanceiroService;

    public StatusFinanceiroController(StatusFinanceiroService statusFinanceiroService) {
        this.statusFinanceiroService = statusFinanceiroService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Listar todos os status financeiros")
    public ResponseEntity<List<StatusFinanceiroDTO>> listar() {
        return ResponseEntity.ok(statusFinanceiroService.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Buscar status por ID")
    public ResponseEntity<StatusFinanceiroDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(statusFinanceiroService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar status financeiro (apenas ADMIN)")
    public ResponseEntity<StatusFinanceiroDTO> criar(@Valid @RequestBody StatusFinanceiroDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(statusFinanceiroService.criar(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar status financeiro (apenas ADMIN)")
    public ResponseEntity<StatusFinanceiroDTO> atualizar(@PathVariable Long id, @Valid @RequestBody StatusFinanceiroDTO dto) {
        return ResponseEntity.ok(statusFinanceiroService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar status financeiro (apenas ADMIN)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        statusFinanceiroService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
