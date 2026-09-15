package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "transferencias_orcamento")
public class TransferenciaOrcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_origem_id", nullable = false)
    private Evento eventoOrigem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_origem_id", nullable = false)
    private Categoria categoriaOrigem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_destino_id", nullable = false)
    private Evento eventoDestino;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_destino_id", nullable = false)
    private Categoria categoriaDestino;

    @Column(name = "valor_usd", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorUsd;

    @Column(name = "taxa_cambio", nullable = false, precision = 10, scale = 4)
    private BigDecimal taxaCambio;

    @Column(name = "valor_brl", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorBrl;

    @Column(name = "motivo", columnDefinition = "TEXT")
    private String motivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    public TransferenciaOrcamento() {}

    public TransferenciaOrcamento(Long id, Evento eventoOrigem, Categoria categoriaOrigem,
                                  Evento eventoDestino, Categoria categoriaDestino,
                                  BigDecimal valorUsd, BigDecimal taxaCambio, BigDecimal valorBrl,
                                  String motivo, Usuario usuario, OffsetDateTime criadoEm) {
        this.id = id;
        this.eventoOrigem = eventoOrigem;
        this.categoriaOrigem = categoriaOrigem;
        this.eventoDestino = eventoDestino;
        this.categoriaDestino = categoriaDestino;
        this.valorUsd = valorUsd;
        this.taxaCambio = taxaCambio;
        this.valorBrl = valorBrl;
        this.motivo = motivo;
        this.usuario = usuario;
        this.criadoEm = criadoEm != null ? criadoEm : OffsetDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Evento eventoOrigem;
        private Categoria categoriaOrigem;
        private Evento eventoDestino;
        private Categoria categoriaDestino;
        private BigDecimal valorUsd;
        private BigDecimal taxaCambio;
        private BigDecimal valorBrl;
        private String motivo;
        private Usuario usuario;
        private OffsetDateTime criadoEm = OffsetDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder eventoOrigem(Evento eventoOrigem) { this.eventoOrigem = eventoOrigem; return this; }
        public Builder categoriaOrigem(Categoria categoriaOrigem) { this.categoriaOrigem = categoriaOrigem; return this; }
        public Builder eventoDestino(Evento eventoDestino) { this.eventoDestino = eventoDestino; return this; }
        public Builder categoriaDestino(Categoria categoriaDestino) { this.categoriaDestino = categoriaDestino; return this; }
        public Builder valorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; return this; }
        public Builder taxaCambio(BigDecimal taxaCambio) { this.taxaCambio = taxaCambio; return this; }
        public Builder valorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; return this; }
        public Builder motivo(String motivo) { this.motivo = motivo; return this; }
        public Builder usuario(Usuario usuario) { this.usuario = usuario; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public TransferenciaOrcamento build() {
            return new TransferenciaOrcamento(id, eventoOrigem, categoriaOrigem, eventoDestino, categoriaDestino, valorUsd, taxaCambio, valorBrl, motivo, usuario, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Evento getEventoOrigem() { return eventoOrigem; }
    public void setEventoOrigem(Evento eventoOrigem) { this.eventoOrigem = eventoOrigem; }
    public Categoria getCategoriaOrigem() { return categoriaOrigem; }
    public void setCategoriaOrigem(Categoria categoriaOrigem) { this.categoriaOrigem = categoriaOrigem; }
    public Evento getEventoDestino() { return eventoDestino; }
    public void setEventoDestino(Evento eventoDestino) { this.eventoDestino = eventoDestino; }
    public Categoria getCategoriaDestino() { return categoriaDestino; }
    public void setCategoriaDestino(Categoria categoriaDestino) { this.categoriaDestino = categoriaDestino; }
    public BigDecimal getValorUsd() { return valorUsd; }
    public void setValorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; }
    public BigDecimal getTaxaCambio() { return taxaCambio; }
    public void setTaxaCambio(BigDecimal taxaCambio) { this.taxaCambio = taxaCambio; }
    public BigDecimal getValorBrl() { return valorBrl; }
    public void setValorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
