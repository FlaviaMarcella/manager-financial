package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "configuracao_global")
public class ConfiguracaoGlobal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "taxa_cambio_usd_brl", nullable = false, precision = 10, scale = 4)
    private BigDecimal taxaCambioUsdBrl = new BigDecimal("5.5000");

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm = OffsetDateTime.now();

    @Column(name = "atualizado_por")
    private String atualizadoPor;

    public ConfiguracaoGlobal() {}

    public ConfiguracaoGlobal(Long id, BigDecimal taxaCambioUsdBrl, OffsetDateTime atualizadoEm, String atualizadoPor) {
        this.id = id;
        this.taxaCambioUsdBrl = taxaCambioUsdBrl != null ? taxaCambioUsdBrl : new BigDecimal("5.5000");
        this.atualizadoEm = atualizadoEm != null ? atualizadoEm : OffsetDateTime.now();
        this.atualizadoPor = atualizadoPor;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private BigDecimal taxaCambioUsdBrl = new BigDecimal("5.5000");
        private OffsetDateTime atualizadoEm = OffsetDateTime.now();
        private String atualizadoPor;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder taxaCambioUsdBrl(BigDecimal taxaCambioUsdBrl) { this.taxaCambioUsdBrl = taxaCambioUsdBrl; return this; }
        public Builder atualizadoEm(OffsetDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; return this; }
        public Builder atualizadoPor(String atualizadoPor) { this.atualizadoPor = atualizadoPor; return this; }
        public ConfiguracaoGlobal build() { return new ConfiguracaoGlobal(id, taxaCambioUsdBrl, atualizadoEm, atualizadoPor); }
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
