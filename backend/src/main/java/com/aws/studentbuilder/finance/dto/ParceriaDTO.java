package com.aws.studentbuilder.finance.dto;

import com.aws.studentbuilder.finance.entity.StatusParceria;
import com.aws.studentbuilder.finance.entity.TipoParceria;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class ParceriaDTO {
    private Long id;
    private String parceiro;
    private TipoParceria tipo;
    private BigDecimal valorContrapartida;
    private String itensRecebidos;
    private Long eventoId;
    private String eventoNome;
    private StatusParceria status;
    private String contato;
    private String observacoes;
    private OffsetDateTime criadoEm;

    public ParceriaDTO() {}

    public ParceriaDTO(Long id, String parceiro, TipoParceria tipo, BigDecimal valorContrapartida,
                       String itensRecebidos, Long eventoId, String eventoNome, StatusParceria status,
                       String contato, String observacoes, OffsetDateTime criadoEm) {
        this.id = id;
        this.parceiro = parceiro;
        this.tipo = tipo;
        this.valorContrapartida = valorContrapartida;
        this.itensRecebidos = itensRecebidos;
        this.eventoId = eventoId;
        this.eventoNome = eventoNome;
        this.status = status;
        this.contato = contato;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String parceiro;
        private TipoParceria tipo;
        private BigDecimal valorContrapartida;
        private String itensRecebidos;
        private Long eventoId;
        private String eventoNome;
        private StatusParceria status;
        private String contato;
        private String observacoes;
        private OffsetDateTime criadoEm;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder parceiro(String parceiro) { this.parceiro = parceiro; return this; }
        public Builder tipo(TipoParceria tipo) { this.tipo = tipo; return this; }
        public Builder valorContrapartida(BigDecimal valorContrapartida) { this.valorContrapartida = valorContrapartida; return this; }
        public Builder itensRecebidos(String itensRecebidos) { this.itensRecebidos = itensRecebidos; return this; }
        public Builder eventoId(Long eventoId) { this.eventoId = eventoId; return this; }
        public Builder eventoNome(String eventoNome) { this.eventoNome = eventoNome; return this; }
        public Builder status(StatusParceria status) { this.status = status; return this; }
        public Builder contato(String contato) { this.contato = contato; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public ParceriaDTO build() {
            return new ParceriaDTO(id, parceiro, tipo, valorContrapartida, itensRecebidos, eventoId, eventoNome, status, contato, observacoes, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public String getEventoNome() { return eventoNome; }
    public void setEventoNome(String eventoNome) { this.eventoNome = eventoNome; }
    public StatusParceria getStatus() { return status; }
    public void setStatus(StatusParceria status) { this.status = status; }
    public String getContato() { return contato; }
    public void setContato(String contato) { this.contato = contato; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
