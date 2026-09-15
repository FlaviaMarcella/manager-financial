package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.ConfiguracaoGlobalDTO;
import com.aws.studentbuilder.finance.dto.CotacaoDolarDTO;
import com.aws.studentbuilder.finance.entity.ConfiguracaoGlobal;
import com.aws.studentbuilder.finance.repository.ConfiguracaoGlobalRepository;
import com.aws.studentbuilder.finance.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;

@Service
public class ConfigService {

    private final ConfiguracaoGlobalRepository configRepository;
    private final CotacaoMoedaService cotacaoMoedaService;

    public ConfigService(ConfiguracaoGlobalRepository configRepository,
                         CotacaoMoedaService cotacaoMoedaService) {
        this.configRepository = configRepository;
        this.cotacaoMoedaService = cotacaoMoedaService;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoGlobalDTO getConfiguracao() {
        ConfiguracaoGlobal config = configRepository.findById(1L)
                .orElseGet(() -> configRepository.save(
                        ConfiguracaoGlobal.builder()
                                .id(1L)
                                .taxaCambioUsdBrl(new BigDecimal("5.5000"))
                                .atualizadoEm(OffsetDateTime.now())
                                .atualizadoPor("sistema")
                                .build()
                ));
        return toDTO(config);
    }

    @Transactional
    public ConfiguracaoGlobalDTO atualizarTaxaCambio(ConfiguracaoGlobalDTO dto) {
        ConfiguracaoGlobal config = configRepository.findById(1L)
                .orElse(ConfiguracaoGlobal.builder().id(1L).build());

        config.setTaxaCambioUsdBrl(dto.getTaxaCambioUsdBrl());
        config.setAtualizadoEm(OffsetDateTime.now());
        config.setAtualizadoPor(SecurityUtils.getCurrentUserEmail().orElse("admin"));

        ConfiguracaoGlobal salva = configRepository.save(config);
        return toDTO(salva);
    }

    @Transactional
    public ConfiguracaoGlobalDTO sincronizarComCotacaoOficial(BigDecimal spreadPercentual) {
        CotacaoDolarDTO cotacao = cotacaoMoedaService.obterCotacaoDolarAtual();
        BigDecimal taxaFinal = cotacao.getCotacaoOficial();

        // Se houver percentual de spread (ex: 2.5% de taxa de conversão descontada)
        if (spreadPercentual != null && spreadPercentual.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal fator = BigDecimal.ONE.subtract(spreadPercentual.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
            taxaFinal = taxaFinal.multiply(fator).setScale(4, RoundingMode.HALF_UP);
        }

        ConfiguracaoGlobal config = configRepository.findById(1L)
                .orElse(ConfiguracaoGlobal.builder().id(1L).build());

        config.setTaxaCambioUsdBrl(taxaFinal);
        config.setAtualizadoEm(OffsetDateTime.now());
        config.setAtualizadoPor(SecurityUtils.getCurrentUserEmail().orElse("sistema"));

        ConfiguracaoGlobal salva = configRepository.save(config);
        return toDTO(salva);
    }

    public CotacaoDolarDTO obterCotacaoMercadoAtual() {
        return cotacaoMoedaService.obterCotacaoDolarAtual();
    }

    @Transactional(readOnly = true)
    public BigDecimal getTaxaCambioAtual() {
        return getConfiguracao().getTaxaCambioUsdBrl();
    }

    private ConfiguracaoGlobalDTO toDTO(ConfiguracaoGlobal c) {
        return ConfiguracaoGlobalDTO.builder()
                .id(c.getId())
                .taxaCambioUsdBrl(c.getTaxaCambioUsdBrl())
                .atualizadoEm(c.getAtualizadoEm())
                .atualizadoPor(c.getAtualizadoPor())
                .build();
    }
}
