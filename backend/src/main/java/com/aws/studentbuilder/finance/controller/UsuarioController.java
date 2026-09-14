package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.UpdateUsuarioRoleRequest;
import com.aws.studentbuilder.finance.dto.UsuarioDTO;
import com.aws.studentbuilder.finance.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Gestão de Usuários", description = "Listagem de usuários e gerenciamento de papéis ADMIN / VIEWER")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos os usuários (apenas ADMIN)")
    public ResponseEntity<List<UsuarioDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Buscar usuário por ID (apenas ADMIN)")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar papel (ADMIN / VIEWER) ou status ativo do usuário (apenas ADMIN)")
    public ResponseEntity<UsuarioDTO> atualizarPapel(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUsuarioRoleRequest request
    ) {
        return ResponseEntity.ok(usuarioService.atualizarPapelEStatus(id, request));
    }
}
