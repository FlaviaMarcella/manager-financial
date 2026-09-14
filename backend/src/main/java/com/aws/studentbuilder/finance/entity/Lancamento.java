package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "lancamentos")
public class Lancamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(nullable = false)
    private String fornecedor;

    @Column(name = "numero_nota_fiscal", length = 100)
    private String numeroNotaFiscal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "valor_usd", precision = 15, scale = 2)
    private BigDecimal valorUsd = BigDecimal.ZERO;

    @Column(name = "valor_brl", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorBrl = BigDecimal.ZERO;

    @Column(name = "forma_pagamento", nullable = false, length = 100)
    private String formaPagamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private StatusFinanceiro status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;

    @Column(name = "anexo_url", length = 1000)
    private String anexoUrl;

    @Column(name = "anexo_nome_original")
    private String anexoNomeOriginal;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    public Lancamento() {}

    public Lancamento(Long id, LocalDate data, String descricao, String fornecedor, String numeroNotaFiscal,
                      Evento evento, Categoria categoria, BigDecimal valorUsd, BigDecimal valorBrl,
                      String formaPagamento, StatusFinanceiro status, Usuario responsavel,
                      String anexoUrl, String anexoNomeOriginal, String observacoes, OffsetDateTime criadoEm) {
        this.id = id;
        this.data = data;
        this.descricao = descricao;
        this.fornecedor = fornecedor;
        this.numeroNotaFiscal = numeroNotaFiscal;
        this.evento = evento;
        this.categoria = categoria;
        this.valorUsd = valorUsd != null ? valorUsd : BigDecimal.ZERO;
        this.valorBrl = valorBrl != null ? valorBrl : BigDecimal.ZERO;
        this.formaPagamento = formaPagamento;
        this.status = status;
        this.responsavel = responsavel;
        this.anexoUrl = anexoUrl;
        this.anexoNomeOriginal = anexoNomeOriginal;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm != null ? criadoEm : OffsetDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private LocalDate data;
        private String descricao;
        private String fornecedor;
        private String numeroNotaFiscal;
        private Evento evento;
        private Categoria categoria;
        private BigDecimal valorUsd = BigDecimal.ZERO;
        private BigDecimal valorBrl = BigDecimal.ZERO;
        private String formaPagamento;
        private StatusFinanceiro status;
        private Usuario responsavel;
        private String anexoUrl;
        private String anexoNomeOriginal;
        private String observacoes;
        private OffsetDateTime criadoEm = OffsetDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder data(LocalDate data) { this.data = data; return this; }
        public Builder descricao(String descricao) { this.descricao = descricao; return this; }
        public Builder fornecedor(String fornecedor) { this.fornecedor = fornecedor; return this; }
        public Builder numeroNotaFiscal(String numeroNotaFiscal) { this.numeroNotaFiscal = numeroNotaFiscal; return this; }
        public Builder evento(Evento evento) { this.evento = evento; return this; }
        public Builder categoria(Categoria categoria) { this.categoria = categoria; return this; }
        public Builder valorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; return this; }
        public Builder valorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; return this; }
        public Builder formaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; return this; }
        public Builder status(StatusFinanceiro status) { this.status = status; return this; }
        public Builder responsavel(Usuario responsavel) { this.responsavel = responsavel; return this; }
        public Builder anexoUrl(String anexoUrl) { this.anexoUrl = anexoUrl; return this; }
        public Builder anexoNomeOriginal(String anexoNomeOriginal) { this.anexoNomeOriginal = anexoNomeOriginal; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public Lancamento build() {
            return new Lancamento(id, data, descricao, fornecedor, numeroNotaFiscal, evento, categoria, valorUsd, valorBrl, formaPagamento, status, responsavel, anexoUrl, anexoNomeOriginal, observacoes, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getFornecedor() { return fornecedor; }
    public void setFornecedor(String fornecedor) { this.fornecedor = fornecedor; }
    public String getNumeroNotaFiscal() { return numeroNotaFiscal; }
    public void setNumeroNotaFiscal(String numeroNotaFiscal) { this.numeroNotaFiscal = numeroNotaFiscal; }
    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public BigDecimal getValorUsd() { return valorUsd; }
    public void setValorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; }
    public BigDecimal getValorBrl() { return valorBrl; }
    public void setValorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; }
    public String getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; }
    public StatusFinanceiro getStatus() { return status; }
    public void setStatus(StatusFinanceiro status) { this.status = status; }
    public Usuario getResponsavel() { return responsavel; }
    public void setResponsavel(Usuario responsavel) { this.responsavel = responsavel; }
    public String getAnexoUrl() { return anexoUrl; }
    public void setAnexoUrl(String anexoUrl) { this.anexoUrl = anexoUrl; }
    public String getAnexoNomeOriginal() { return anexoNomeOriginal; }
    public void setAnexoNomeOriginal(String anexoNomeOriginal) { this.anexoNomeOriginal = anexoNomeOriginal; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
