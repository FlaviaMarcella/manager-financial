package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.ConfiguracaoGlobalDTO;
import com.aws.studentbuilder.finance.dto.CotacaoDolarDTO;
import com.aws.studentbuilder.finance.service.ConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/config")
@Tag(name = "Configurações Globais", description = "Taxa de câmbio USD -> BRL, cotação do dia e preferências do sistema")
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

    @GetMapping("/cotacao-atual")
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    @Operation(summary = "Obter cotação em tempo real do Dólar Comercial do dia")
    public ResponseEntity<CotacaoDolarDTO> getCotacaoAtual() {
        return ResponseEntity.ok(configService.obterCotacaoMercadoAtual());
    }

    @PostMapping("/sincronizar-cotacao")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Sincronizar taxa do sistema com a cotação oficial do mercado (com spread opcional)")
    public ResponseEntity<ConfiguracaoGlobalDTO> sincronizarCotacao(
            @RequestParam(required = false) BigDecimal spreadPercentual) {
        return ResponseEntity.ok(configService.sincronizarComCotacaoOficial(spreadPercentual));
    }
}
