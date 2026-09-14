package com.aws.studentbuilder.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class ConfiguracaoGlobalDTO {
    private Long id;

    @NotNull(message = "Taxa de câmbio é obrigatória")
    @DecimalMin(value = "0.0001", message = "Taxa de câmbio deve ser maior que zero")
    private BigDecimal taxaCambioUsdBrl;

    private OffsetDateTime atualizadoEm;
    private String atualizadoPor;

    public ConfiguracaoGlobalDTO() {}

    public ConfiguracaoGlobalDTO(Long id, BigDecimal taxaCambioUsdBrl, OffsetDateTime atualizadoEm, String atualizadoPor) {
        this.id = id;
        this.taxaCambioUsdBrl = taxaCambioUsdBrl;
        this.atualizadoEm = atualizadoEm;
        this.atualizadoPor = atualizadoPor;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private BigDecimal taxaCambioUsdBrl;
        private OffsetDateTime atualizadoEm;
        private String atualizadoPor;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder taxaCambioUsdBrl(BigDecimal taxaCambioUsdBrl) { this.taxaCambioUsdBrl = taxaCambioUsdBrl; return this; }
        public Builder atualizadoEm(OffsetDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; return this; }
        public Builder atualizadoPor(String atualizadoPor) { this.atualizadoPor = atualizadoPor; return this; }
        public ConfiguracaoGlobalDTO build() { return new ConfiguracaoGlobalDTO(id, taxaCambioUsdBrl, atualizadoEm, atualizadoPor); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BigDecimal getTaxaCambioUsdBrl() { return taxaCambioUsdBrl; }
    public void setTaxaCambioUsdBrl(BigDecimal taxaCambioUsdBrl) { this.taxaCambioUsdBrl = taxaCambioUsdBrl; }
    public OffsetDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(OffsetDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }
    public String getAtualizadoPor() { return atualizadoPor; }
    public void setAtualizadoPor(String atualizadoPor) { this.atualizadoPor = atualizadoPor; }
}
