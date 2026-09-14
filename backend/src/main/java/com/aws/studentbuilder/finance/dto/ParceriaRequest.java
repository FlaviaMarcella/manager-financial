package com.aws.studentbuilder.finance.dto;

import com.aws.studentbuilder.finance.entity.StatusParceria;
import com.aws.studentbuilder.finance.entity.TipoParceria;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ParceriaRequest {
    @NotBlank(message = "Nome do parceiro é obrigatório")
    private String parceiro;

    @NotNull(message = "Tipo de parceria é obrigatório")
    private TipoParceria tipo;

    private BigDecimal valorContrapartida;
    private String itensRecebidos;
    private Long eventoId;
    private StatusParceria status = StatusParceria.NEGOCIACAO;
    private String contato;
    private String observacoes;

    public ParceriaRequest() {}

    public ParceriaRequest(String parceiro, TipoParceria tipo, BigDecimal valorContrapartida,
                           String itensRecebidos, Long eventoId, StatusParceria status,
                           String contato, String observacoes) {
        this.parceiro = parceiro;
        this.tipo = tipo;
        this.valorContrapartida = valorContrapartida;
        this.itensRecebidos = itensRecebidos;
        this.eventoId = eventoId;
        this.status = status != null ? status : StatusParceria.NEGOCIACAO;
        this.contato = contato;
        this.observacoes = observacoes;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String parceiro;
        private TipoParceria tipo;
        private BigDecimal valorContrapartida;
        private String itensRecebidos;
        private Long eventoId;
        private StatusParceria status = StatusParceria.NEGOCIACAO;
        private String contato;
        private String observacoes;

        public Builder id(Long id) { return this; }
        public Builder parceiro(String parceiro) { this.parceiro = parceiro; return this; }
        public Builder tipo(TipoParceria tipo) { this.tipo = tipo; return this; }
        public Builder valorContrapartida(BigDecimal valorContrapartida) { this.valorContrapartida = valorContrapartida; return this; }
        public Builder itensRecebidos(String itensRecebidos) { this.itensRecebidos = itensRecebidos; return this; }
        public Builder eventoId(Long eventoId) { this.eventoId = eventoId; return this; }
        public Builder status(StatusParceria status) { this.status = status; return this; }
        public Builder contato(String contato) { this.contato = contato; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public ParceriaRequest build() {
            return new ParceriaRequest(parceiro, tipo, valorContrapartida, itensRecebidos, eventoId, status, contato, observacoes);
        }
    }

    public String getParceiro() { return parceiro; }
    public void setParceiro(String parceiro) { this.parceiro = parceiro; }
    public TipoParceria getTipo() { return tipo; }
    public void setTipo(TipoParceria tipo) { this.tipo = tipo; }
    public BigDecimal getValorContrapartida() { return valorContrapartida; }
    public void setValorContrapartida(BigDecimal valorContrapartida) { this.valorContrapartida = valorContrapartida; }
    public String getItensRecebidos() { return itensRecebidos; }
    public void setItensRecebidos(String itensRecebidos) { this.itensRecebidos = itensRecebidos; }
    public Long getEventoId() { return eventoId; }
    public void setEventoId(Long eventoId) { this.eventoId = eventoId; }
    public StatusParceria getStatus() { return status; }
    public void setStatus(StatusParceria status) { this.status = status; }
    public String getContato() { return contato; }
    public void setContato(String contato) { this.contato = contato; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
