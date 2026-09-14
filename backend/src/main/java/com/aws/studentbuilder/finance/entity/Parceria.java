package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "parcerias")
public class Parceria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String parceiro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private TipoParceria tipo;

    @Column(name = "valor_contrapartida", precision = 15, scale = 2)
    private BigDecimal valorContrapartida = BigDecimal.ZERO;

    @Column(name = "itens_recebidos", columnDefinition = "TEXT")
    private String itensRecebidos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id")
    private Evento evento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private StatusParceria status = StatusParceria.NEGOCIACAO;

    private String contato;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    public Parceria() {}

    public Parceria(Long id, String parceiro, TipoParceria tipo, BigDecimal valorContrapartida, String itensRecebidos, Evento evento, StatusParceria status, String contato, String observacoes, OffsetDateTime criadoEm) {
        this.id = id;
        this.parceiro = parceiro;
        this.tipo = tipo;
        this.valorContrapartida = valorContrapartida != null ? valorContrapartida : BigDecimal.ZERO;
        this.itensRecebidos = itensRecebidos;
        this.evento = evento;
        this.status = status != null ? status : StatusParceria.NEGOCIACAO;
        this.contato = contato;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm != null ? criadoEm : OffsetDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String parceiro;
        private TipoParceria tipo;
        private BigDecimal valorContrapartida = BigDecimal.ZERO;
        private String itensRecebidos;
        private Evento evento;
        private StatusParceria status = StatusParceria.NEGOCIACAO;
        private String contato;
        private String observacoes;
        private OffsetDateTime criadoEm = OffsetDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder parceiro(String parceiro) { this.parceiro = parceiro; return this; }
        public Builder tipo(TipoParceria tipo) { this.tipo = tipo; return this; }
        public Builder valorContrapartida(BigDecimal valorContrapartida) { this.valorContrapartida = valorContrapartida; return this; }
        public Builder itensRecebidos(String itensRecebidos) { this.itensRecebidos = itensRecebidos; return this; }
        public Builder evento(Evento evento) { this.evento = evento; return this; }
        public Builder status(StatusParceria status) { this.status = status; return this; }
        public Builder contato(String contato) { this.contato = contato; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public Parceria build() { return new Parceria(id, parceiro, tipo, valorContrapartida, itensRecebidos, evento, status, contato, observacoes, criadoEm); }
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
    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
    public StatusParceria getStatus() { return status; }
    public void setStatus(StatusParceria status) { this.status = status; }
    public String getContato() { return contato; }
    public void setContato(String contato) { this.contato = contato; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
