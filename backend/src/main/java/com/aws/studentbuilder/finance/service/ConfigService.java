package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.ConfiguracaoGlobalDTO;
import com.aws.studentbuilder.finance.entity.ConfiguracaoGlobal;
import com.aws.studentbuilder.finance.repository.ConfiguracaoGlobalRepository;
import com.aws.studentbuilder.finance.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
public class ConfigService {

    private final ConfiguracaoGlobalRepository configRepository;

    public ConfigService(ConfiguracaoGlobalRepository configRepository) {
        this.configRepository = configRepository;
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
