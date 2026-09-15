package com.aws.studentbuilder.finance.dto;

import java.math.BigDecimal;

public class CategoriaSaldoDisponivelDTO {
    private Long categoriaId;
    private String categoriaNome;
    private BigDecimal valorOrcadoUsd;
    private BigDecimal valorGastoUsd;
    private BigDecimal saldoDisponivelUsd;
    private BigDecimal saldoDisponivelBrl;

    public CategoriaSaldoDisponivelDTO() {}

    public CategoriaSaldoDisponivelDTO(Long categoriaId, String categoriaNome, BigDecimal valorOrcadoUsd, BigDecimal valorGastoUsd, BigDecimal saldoDisponivelUsd, BigDecimal saldoDisponivelBrl) {
        this.categoriaId = categoriaId;
        this.categoriaNome = categoriaNome;
        this.valorOrcadoUsd = valorOrcadoUsd;
        this.valorGastoUsd = valorGastoUsd;
        this.saldoDisponivelUsd = saldoDisponivelUsd;
        this.saldoDisponivelBrl = saldoDisponivelBrl;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long categoriaId;
        private String categoriaNome;
        private BigDecimal valorOrcadoUsd;
        private BigDecimal valorGastoUsd;
        private BigDecimal saldoDisponivelUsd;
        private BigDecimal saldoDisponivelBrl;

        public Builder categoriaId(Long categoriaId) { this.categoriaId = categoriaId; return this; }
        public Builder categoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; return this; }
        public Builder valorOrcadoUsd(BigDecimal valorOrcadoUsd) { this.valorOrcadoUsd = valorOrcadoUsd; return this; }
        public Builder valorGastoUsd(BigDecimal valorGastoUsd) { this.valorGastoUsd = valorGastoUsd; return this; }
        public Builder saldoDisponivelUsd(BigDecimal saldoDisponivelUsd) { this.saldoDisponivelUsd = saldoDisponivelUsd; return this; }
        public Builder saldoDisponivelBrl(BigDecimal saldoDisponivelBrl) { this.saldoDisponivelBrl = saldoDisponivelBrl; return this; }
        public CategoriaSaldoDisponivelDTO build() {
            return new CategoriaSaldoDisponivelDTO(categoriaId, categoriaNome, valorOrcadoUsd, valorGastoUsd, saldoDisponivelUsd, saldoDisponivelBrl);
        }
    }

    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public String getCategoriaNome() { return categoriaNome; }
    public void setCategoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; }
    public BigDecimal getValorOrcadoUsd() { return valorOrcadoUsd; }
    public void setValorOrcadoUsd(BigDecimal valorOrcadoUsd) { this.valorOrcadoUsd = valorOrcadoUsd; }
    public BigDecimal getValorGastoUsd() { return valorGastoUsd; }
    public void setValorGastoUsd(BigDecimal valorGastoUsd) { this.valorGastoUsd = valorGastoUsd; }
    public BigDecimal getSaldoDisponivelUsd() { return saldoDisponivelUsd; }
    public void setSaldoDisponivelUsd(BigDecimal saldoDisponivelUsd) { this.saldoDisponivelUsd = saldoDisponivelUsd; }
    public BigDecimal getSaldoDisponivelBrl() { return saldoDisponivelBrl; }
    public void setSaldoDisponivelBrl(BigDecimal saldoDisponivelBrl) { this.saldoDisponivelBrl = saldoDisponivelBrl; }
}
