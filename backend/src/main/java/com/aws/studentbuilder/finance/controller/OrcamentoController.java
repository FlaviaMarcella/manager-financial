package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.CategoriaSaldoDisponivelDTO;
import com.aws.studentbuilder.finance.dto.ItemOrcamentoDTO;
import com.aws.studentbuilder.finance.dto.ItemOrcamentoRequest;
import com.aws.studentbuilder.finance.dto.TransferenciaOrcamentoDTO;
import com.aws.studentbuilder.finance.dto.TransferenciaOrcamentoRequest;
import com.aws.studentbuilder.finance.service.OrcamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orcamento")
@Tag(name = "Orçamento", description = "Gestão de linhas orçamentárias por evento, categoria e transferências")
public class OrcamentoController {

    private final OrcamentoService orcamentoService;

    public OrcamentoController(OrcamentoService orcamentoService) {
        this.orcamentoService = orcamentoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Listar itens de orçamento")
    public ResponseEntity<List<ItemOrcamentoDTO>> listar(@RequestParam(required = false) Long eventoId) {
        return ResponseEntity.ok(orcamentoService.listar(eventoId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Buscar item de orçamento por ID")
    public ResponseEntity<ItemOrcamentoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(orcamentoService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar novo item de orçamento (apenas ADMIN)")
    public ResponseEntity<ItemOrcamentoDTO> criar(@Valid @RequestBody ItemOrcamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orcamentoService.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar item de orçamento (apenas ADMIN)")
    public ResponseEntity<ItemOrcamentoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody ItemOrcamentoRequest request) {
        return ResponseEntity.ok(orcamentoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar item de orçamento (apenas ADMIN)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        orcamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transferencias")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Transferir saldo remanescente entre eventos e categorias (apenas ADMIN)")
    public ResponseEntity<TransferenciaOrcamentoDTO> transferirSaldo(@Valid @RequestBody TransferenciaOrcamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orcamentoService.transferirSaldo(request));
    }

    @GetMapping("/transferencias")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Listar histórico de transferências de saldo")
    public ResponseEntity<List<TransferenciaOrcamentoDTO>> listarTransferencias(@RequestParam(required = false) Long eventoId) {
        return ResponseEntity.ok(orcamentoService.listarTransferencias(eventoId));
    }

    @GetMapping("/eventos/{eventoId}/saldos-disponiveis")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Obter saldos disponíveis por categoria para um evento de origem")
    public ResponseEntity<List<CategoriaSaldoDisponivelDTO>> obterSaldosDisponiveis(@PathVariable Long eventoId) {
        return ResponseEntity.ok(orcamentoService.obterSaldosDisponiveis(eventoId));
    }
}
