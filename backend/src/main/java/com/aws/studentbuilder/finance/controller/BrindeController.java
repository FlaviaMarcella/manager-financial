package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.BrindeDTO;
import com.aws.studentbuilder.finance.dto.BrindeRequest;
import com.aws.studentbuilder.finance.service.BrindeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brindes")
@Tag(name = "Brindes e Itens", description = "Controle de estoque, recebimento e distribuição de brindes")
public class BrindeController {

    private final BrindeService brindeService;

    public BrindeController(BrindeService brindeService) {
        this.brindeService = brindeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Listar brindes e itens em estoque")
    public ResponseEntity<List<BrindeDTO>> listar(
            @RequestParam(required = false) Long eventoId,
            @RequestParam(required = false) Long parceriaId
    ) {
        return ResponseEntity.ok(brindeService.listar(eventoId, parceriaId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Buscar brinde por ID")
    public ResponseEntity<BrindeDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(brindeService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cadastrar brinde/item (apenas ADMIN)")
    public ResponseEntity<BrindeDTO> criar(@Valid @RequestBody BrindeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brindeService.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar brinde/item (apenas ADMIN)")
    public ResponseEntity<BrindeDTO> atualizar(@PathVariable Long id, @Valid @RequestBody BrindeRequest request) {
        return ResponseEntity.ok(brindeService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar brinde/item (apenas ADMIN)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        brindeService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
