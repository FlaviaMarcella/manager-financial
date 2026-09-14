package com.aws.studentbuilder.finance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class ItemOrcamentoRequest {
    @NotNull(message = "Evento é obrigatório")
    private Long eventoId;

    @NotNull(message = "Categoria é obrigatória")
    private Long categoriaId;

    @NotNull(message = "Valor orçado em USD é obrigatório")
    @PositiveOrZero(message = "Valor orçado deve ser maior ou igual a zero")
    private BigDecimal valorOrcadoUsd;

    private BigDecimal taxaCambioUsada;
    private String observacoes;

    public ItemOrcamentoRequest() {}

    public ItemOrcamentoRequest(Long eventoId, Long categoriaId, BigDecimal valorOrcadoUsd, BigDecimal taxaCambioUsada, String observacoes) {
        this.eventoId = eventoId;
        this.categoriaId = categoriaId;
        this.valorOrcadoUsd = valorOrcadoUsd;
        this.taxaCambioUsada = taxaCambioUsada;
        this.observacoes = observacoes;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long eventoId;
        private Long categoriaId;
        private BigDecimal valorOrcadoUsd;
        private BigDecimal taxaCambioUsada;
        private String observacoes;

        public Builder eventoId(Long eventoId) { this.eventoId = eventoId; return this; }
        public Builder categoriaId(Long categoriaId) { this.categoriaId = categoriaId; return this; }
        public Builder valorOrcadoUsd(BigDecimal valorOrcadoUsd) { this.valorOrcadoUsd = valorOrcadoUsd; return this; }
        public Builder taxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public ItemOrcamentoRequest build() { return new ItemOrcamentoRequest(eventoId, categoriaId, valorOrcadoUsd, taxaCambioUsada, observacoes); }
    }

    public Long getEventoId() { return eventoId; }
    public void setEventoId(Long eventoId) { this.eventoId = eventoId; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public BigDecimal getValorOrcadoUsd() { return valorOrcadoUsd; }
    public void setValorOrcadoUsd(BigDecimal valorOrcadoUsd) { this.valorOrcadoUsd = valorOrcadoUsd; }
    public BigDecimal getTaxaCambioUsada() { return taxaCambioUsada; }
    public void setTaxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
