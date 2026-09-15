package com.aws.studentbuilder.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TransferenciaOrcamentoRequest {

    @NotNull(message = "O evento de origem é obrigatório")
    private Long eventoOrigemId;

    @NotNull(message = "A categoria de origem é obrigatória")
    private Long categoriaOrigemId;

    @NotNull(message = "O evento de destino é obrigatório")
    private Long eventoDestinoId;

    @NotNull(message = "A categoria de destino é obrigatória")
    private Long categoriaDestinoId;

    @NotNull(message = "O valor em USD é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor transferido deve ser maior que zero")
    private BigDecimal valorUsd;

    private BigDecimal taxaCambio;
    private String motivo;

    public TransferenciaOrcamentoRequest() {}

    public TransferenciaOrcamentoRequest(Long eventoOrigemId, Long categoriaOrigemId, Long eventoDestinoId, Long categoriaDestinoId, BigDecimal valorUsd, BigDecimal taxaCambio, String motivo) {
        this.eventoOrigemId = eventoOrigemId;
        this.categoriaOrigemId = categoriaOrigemId;
        this.eventoDestinoId = eventoDestinoId;
        this.categoriaDestinoId = categoriaDestinoId;
        this.valorUsd = valorUsd;
        this.taxaCambio = taxaCambio;
        this.motivo = motivo;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long eventoOrigemId;
        private Long categoriaOrigemId;
        private Long eventoDestinoId;
        private Long categoriaDestinoId;
        private BigDecimal valorUsd;
        private BigDecimal taxaCambio;
        private String motivo;

        public Builder eventoOrigemId(Long eventoOrigemId) { this.eventoOrigemId = eventoOrigemId; return this; }
        public Builder categoriaOrigemId(Long categoriaOrigemId) { this.categoriaOrigemId = categoriaOrigemId; return this; }
        public Builder eventoDestinoId(Long eventoDestinoId) { this.eventoDestinoId = eventoDestinoId; return this; }
        public Builder categoriaDestinoId(Long categoriaDestinoId) { this.categoriaDestinoId = categoriaDestinoId; return this; }
        public Builder valorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; return this; }
        public Builder taxaCambio(BigDecimal taxaCambio) { this.taxaCambio = taxaCambio; return this; }
        public Builder motivo(String motivo) { this.motivo = motivo; return this; }
        public TransferenciaOrcamentoRequest build() {
            return new TransferenciaOrcamentoRequest(eventoOrigemId, categoriaOrigemId, eventoDestinoId, categoriaDestinoId, valorUsd, taxaCambio, motivo);
        }
    }

    public Long getEventoOrigemId() { return eventoOrigemId; }
    public void setEventoOrigemId(Long eventoOrigemId) { this.eventoOrigemId = eventoOrigemId; }
    public Long getCategoriaOrigemId() { return categoriaOrigemId; }
    public void setCategoriaOrigemId(Long categoriaOrigemId) { this.categoriaOrigemId = categoriaOrigemId; }
    public Long getEventoDestinoId() { return eventoDestinoId; }
    public void setEventoDestinoId(Long eventoDestinoId) { this.eventoDestinoId = eventoDestinoId; }
    public Long getCategoriaDestinoId() { return categoriaDestinoId; }
    public void setCategoriaDestinoId(Long categoriaDestinoId) { this.categoriaDestinoId = categoriaDestinoId; }
    public BigDecimal getValorUsd() { return valorUsd; }
    public void setValorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; }
    public BigDecimal getTaxaCambio() { return taxaCambio; }
    public void setTaxaCambio(BigDecimal taxaCambio) { this.taxaCambio = taxaCambio; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
