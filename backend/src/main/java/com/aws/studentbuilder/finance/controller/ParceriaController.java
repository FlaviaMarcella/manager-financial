package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.ParceriaDTO;
import com.aws.studentbuilder.finance.dto.ParceriaRequest;
import com.aws.studentbuilder.finance.service.ParceriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parcerias")
@Tag(name = "Parcerias e Patrocínios", description = "Gestão de parceiros, contrapartidas e apoios")
public class ParceriaController {

    private final ParceriaService parceriaService;

    public ParceriaController(ParceriaService parceriaService) {
        this.parceriaService = parceriaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Listar parcerias")
    public ResponseEntity<List<ParceriaDTO>> listar(@RequestParam(required = false) Long eventoId) {
        return ResponseEntity.ok(parceriaService.listar(eventoId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Buscar parceria por ID")
    public ResponseEntity<ParceriaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(parceriaService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar nova parceria (apenas ADMIN)")
    public ResponseEntity<ParceriaDTO> criar(@Valid @RequestBody ParceriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parceriaService.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar parceria (apenas ADMIN)")
    public ResponseEntity<ParceriaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody ParceriaRequest request) {
        return ResponseEntity.ok(parceriaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar parceria (apenas ADMIN)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        parceriaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
