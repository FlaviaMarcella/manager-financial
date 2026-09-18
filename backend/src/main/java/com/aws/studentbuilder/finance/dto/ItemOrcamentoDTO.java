package com.aws.studentbuilder.finance.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class ItemOrcamentoDTO {
    private Long id;
    private Long eventoId;
    private String eventoNome;
    private Long categoriaId;
    private String categoriaNome;
    private String descricao;
    private BigDecimal valorOrcadoUsd;
    private BigDecimal taxaCambioUsada;
    private BigDecimal valorOrcadoBrl;
    private BigDecimal valorRealizadoUsd;
    private BigDecimal saldoUsd;
    private BigDecimal valorRealizadoBrl;
    private BigDecimal saldoBrl;
    private BigDecimal taxaRetidaTotal;
    private String observacoes;
    private OffsetDateTime criadoEm;

    public ItemOrcamentoDTO() {}

    public ItemOrcamentoDTO(Long id, Long eventoId, String eventoNome, Long categoriaId, String categoriaNome,
                            String descricao, BigDecimal valorOrcadoUsd, BigDecimal taxaCambioUsada, BigDecimal valorOrcadoBrl,
                            BigDecimal valorRealizadoUsd, BigDecimal saldoUsd,
                            BigDecimal valorRealizadoBrl, BigDecimal saldoBrl, BigDecimal taxaRetidaTotal,
                            String observacoes, OffsetDateTime criadoEm) {
        this.id = id;
        this.eventoId = eventoId;
        this.eventoNome = eventoNome;
        this.categoriaId = categoriaId;
        this.categoriaNome = categoriaNome;
        this.descricao = descricao;
        this.valorOrcadoUsd = valorOrcadoUsd;
        this.taxaCambioUsada = taxaCambioUsada;
        this.valorOrcadoBrl = valorOrcadoBrl;
        this.valorRealizadoUsd = valorRealizadoUsd;
        this.saldoUsd = saldoUsd;
        this.valorRealizadoBrl = valorRealizadoBrl;
        this.saldoBrl = saldoBrl;
        this.taxaRetidaTotal = taxaRetidaTotal;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long eventoId;
        private String eventoNome;
        private Long categoriaId;
        private String categoriaNome;
        private String descricao;
        private BigDecimal valorOrcadoUsd;
        private BigDecimal taxaCambioUsada;
        private BigDecimal valorOrcadoBrl;
        private BigDecimal valorRealizadoUsd;
        private BigDecimal saldoUsd;
        private BigDecimal valorRealizadoBrl;
        private BigDecimal saldoBrl;
        private BigDecimal taxaRetidaTotal;
        private String observacoes;
        private OffsetDateTime criadoEm;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder eventoId(Long eventoId) { this.eventoId = eventoId; return this; }
        public Builder eventoNome(String eventoNome) { this.eventoNome = eventoNome; return this; }
        public Builder categoriaId(Long categoriaId) { this.categoriaId = categoriaId; return this; }
        public Builder categoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; return this; }
        public Builder descricao(String descricao) { this.descricao = descricao; return this; }
        public Builder valorOrcadoUsd(BigDecimal valorOrcadoUsd) { this.valorOrcadoUsd = valorOrcadoUsd; return this; }
        public Builder taxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; return this; }
        public Builder valorOrcadoBrl(BigDecimal valorOrcadoBrl) { this.valorOrcadoBrl = valorOrcadoBrl; return this; }
        public Builder valorRealizadoUsd(BigDecimal valorRealizadoUsd) { this.valorRealizadoUsd = valorRealizadoUsd; return this; }
        public Builder saldoUsd(BigDecimal saldoUsd) { this.saldoUsd = saldoUsd; return this; }
        public Builder valorRealizadoBrl(BigDecimal valorRealizadoBrl) { this.valorRealizadoBrl = valorRealizadoBrl; return this; }
        public Builder saldoBrl(BigDecimal saldoBrl) { this.saldoBrl = saldoBrl; return this; }
        public Builder taxaRetidaTotal(BigDecimal taxaRetidaTotal) { this.taxaRetidaTotal = taxaRetidaTotal; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public ItemOrcamentoDTO build() {
            return new ItemOrcamentoDTO(id, eventoId, eventoNome, categoriaId, categoriaNome, descricao, valorOrcadoUsd, taxaCambioUsada, valorOrcadoBrl, valorRealizadoUsd, saldoUsd, valorRealizadoBrl, saldoBrl, taxaRetidaTotal, observacoes, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventoId() { return eventoId; }
    public void setEventoId(Long eventoId) { this.eventoId = eventoId; }
    public String getEventoNome() { return eventoNome; }
    public void setEventoNome(String eventoNome) { this.eventoNome = eventoNome; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public String getCategoriaNome() { return categoriaNome; }
    public void setCategoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getValorOrcadoUsd() { return valorOrcadoUsd; }
    public void setValorOrcadoUsd(BigDecimal valorOrcadoUsd) { this.valorOrcadoUsd = valorOrcadoUsd; }
    public BigDecimal getTaxaCambioUsada() { return taxaCambioUsada; }
    public void setTaxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; }
    public BigDecimal getValorOrcadoBrl() { return valorOrcadoBrl; }
    public void setValorOrcadoBrl(BigDecimal valorOrcadoBrl) { this.valorOrcadoBrl = valorOrcadoBrl; }
    public BigDecimal getValorRealizadoUsd() { return valorRealizadoUsd; }
    public void setValorRealizadoUsd(BigDecimal valorRealizadoUsd) { this.valorRealizadoUsd = valorRealizadoUsd; }
    public BigDecimal getSaldoUsd() { return saldoUsd; }
    public void setSaldoUsd(BigDecimal saldoUsd) { this.saldoUsd = saldoUsd; }
    public BigDecimal getValorRealizadoBrl() { return valorRealizadoBrl; }
    public void setValorRealizadoBrl(BigDecimal valorRealizadoBrl) { this.valorRealizadoBrl = valorRealizadoBrl; }
    public BigDecimal getSaldoBrl() { return saldoBrl; }
    public void setSaldoBrl(BigDecimal saldoBrl) { this.saldoBrl = saldoBrl; }
    public BigDecimal getTaxaRetidaTotal() { return taxaRetidaTotal; }
    public void setTaxaRetidaTotal(BigDecimal taxaRetidaTotal) { this.taxaRetidaTotal = taxaRetidaTotal; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
