package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "itens_orcamento")
public class ItemOrcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(length = 255)
    private String descricao;

    @Column(name = "valor_orcado_usd", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorOrcadoUsd = BigDecimal.ZERO;

    @Column(name = "taxa_cambio_usada", nullable = false, precision = 10, scale = 4)
    private BigDecimal taxaCambioUsada = new BigDecimal("5.5000");

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    public ItemOrcamento() {}

    public ItemOrcamento(Long id, Evento evento, Categoria categoria, String descricao, BigDecimal valorOrcadoUsd, BigDecimal taxaCambioUsada, String observacoes, OffsetDateTime criadoEm) {
        this.id = id;
        this.evento = evento;
        this.categoria = categoria;
        this.descricao = descricao;
        this.valorOrcadoUsd = valorOrcadoUsd != null ? valorOrcadoUsd : BigDecimal.ZERO;
        this.taxaCambioUsada = taxaCambioUsada != null ? taxaCambioUsada : new BigDecimal("5.5000");
        this.observacoes = observacoes;
        this.criadoEm = criadoEm != null ? criadoEm : OffsetDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Evento evento;
        private Categoria categoria;
        private String descricao;
        private BigDecimal valorOrcadoUsd = BigDecimal.ZERO;
        private BigDecimal taxaCambioUsada = new BigDecimal("5.5000");
        private String observacoes;
        private OffsetDateTime criadoEm = OffsetDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder evento(Evento evento) { this.evento = evento; return this; }
        public Builder categoria(Categoria categoria) { this.categoria = categoria; return this; }
        public Builder descricao(String descricao) { this.descricao = descricao; return this; }
        public Builder valorOrcadoUsd(BigDecimal valorOrcadoUsd) { this.valorOrcadoUsd = valorOrcadoUsd; return this; }
        public Builder taxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public ItemOrcamento build() { return new ItemOrcamento(id, evento, categoria, descricao, valorOrcadoUsd, taxaCambioUsada, observacoes, criadoEm); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getValorOrcadoUsd() { return valorOrcadoUsd; }
    public void setValorOrcadoUsd(BigDecimal valorOrcadoUsd) { this.valorOrcadoUsd = valorOrcadoUsd; }
    public BigDecimal getTaxaCambioUsada() { return taxaCambioUsada; }
    public void setTaxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
