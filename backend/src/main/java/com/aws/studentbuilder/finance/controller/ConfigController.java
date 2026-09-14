package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.ConfiguracaoGlobalDTO;
import com.aws.studentbuilder.finance.service.ConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
@Tag(name = "Configurações Globais", description = "Taxa de câmbio USD -> BRL e preferências do sistema")
public class ConfigController {

    private final ConfigService configService;

    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Obter configurações globais e taxa de câmbio")
    public ResponseEntity<ConfiguracaoGlobalDTO> getConfiguracao() {
        return ResponseEntity.ok(configService.getConfiguracao());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar taxa de câmbio USD -> BRL (apenas ADMIN)")
    public ResponseEntity<ConfiguracaoGlobalDTO> atualizarTaxaCambio(@Valid @RequestBody ConfiguracaoGlobalDTO dto) {
        return ResponseEntity.ok(configService.atualizarTaxaCambio(dto));
    }
}
