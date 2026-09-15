package com.aws.studentbuilder.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public class LancamentoRequest {
    @NotNull(message = "Data do lançamento é obrigatória")
    private LocalDate data;

    @NotBlank(message = "Descrição é obrigatória")
    private String descricao;

    @NotBlank(message = "Fornecedor é obrigatório")
    private String fornecedor;

    private String numeroNotaFiscal;

    @NotNull(message = "Evento é obrigatório")
    private Long eventoId;

    @NotNull(message = "Categoria é obrigatória")
    private Long categoriaId;

    private BigDecimal valorUsd;

    @NotNull(message = "Valor em BRL é obrigatório")
    @PositiveOrZero(message = "Valor em BRL deve ser maior ou igual a zero")
    private BigDecimal valorBrl;

    private BigDecimal taxaCambioUsada;

    @NotBlank(message = "Forma de pagamento é obrigatória")
    private String formaPagamento;

    private Long statusId;
    private String observacoes;

    public LancamentoRequest() {}

    public LancamentoRequest(LocalDate data, String descricao, String fornecedor, String numeroNotaFiscal,
                              Long eventoId, Long categoriaId, BigDecimal valorUsd, BigDecimal valorBrl,
                              BigDecimal taxaCambioUsada, String formaPagamento, Long statusId, String observacoes) {
        this.data = data;
        this.descricao = descricao;
        this.fornecedor = fornecedor;
        this.numeroNotaFiscal = numeroNotaFiscal;
        this.eventoId = eventoId;
        this.categoriaId = categoriaId;
        this.valorUsd = valorUsd;
        this.valorBrl = valorBrl;
        this.taxaCambioUsada = taxaCambioUsada;
        this.formaPagamento = formaPagamento;
        this.statusId = statusId;
        this.observacoes = observacoes;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private LocalDate data;
        private String descricao;
        private String fornecedor;
        private String numeroNotaFiscal;
        private Long eventoId;
        private Long categoriaId;
        private BigDecimal valorUsd;
        private BigDecimal valorBrl;
        private BigDecimal taxaCambioUsada;
        private String formaPagamento;
        private Long statusId;
        private String observacoes;

        public Builder data(LocalDate data) { this.data = data; return this; }
        public Builder descricao(String descricao) { this.descricao = descricao; return this; }
        public Builder fornecedor(String fornecedor) { this.fornecedor = fornecedor; return this; }
        public Builder numeroNotaFiscal(String numeroNotaFiscal) { this.numeroNotaFiscal = numeroNotaFiscal; return this; }
        public Builder eventoId(Long eventoId) { this.eventoId = eventoId; return this; }
        public Builder categoriaId(Long categoriaId) { this.categoriaId = categoriaId; return this; }
        public Builder valorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; return this; }
        public Builder valorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; return this; }
        public Builder taxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; return this; }
        public Builder formaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; return this; }
        public Builder statusId(Long statusId) { this.statusId = statusId; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public LancamentoRequest build() {
            return new LancamentoRequest(data, descricao, fornecedor, numeroNotaFiscal, eventoId, categoriaId, valorUsd, valorBrl, taxaCambioUsada, formaPagamento, statusId, observacoes);
        }
    }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getFornecedor() { return fornecedor; }
    public void setFornecedor(String fornecedor) { this.fornecedor = fornecedor; }
    public String getNumeroNotaFiscal() { return numeroNotaFiscal; }
    public void setNumeroNotaFiscal(String numeroNotaFiscal) { this.numeroNotaFiscal = numeroNotaFiscal; }
    public Long getEventoId() { return eventoId; }
    public void setEventoId(Long eventoId) { this.eventoId = eventoId; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public BigDecimal getValorUsd() { return valorUsd; }
    public void setValorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; }
    public BigDecimal getValorBrl() { return valorBrl; }
    public void setValorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; }
    public BigDecimal getTaxaCambioUsada() { return taxaCambioUsada; }
    public void setTaxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; }
    public String getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; }
    public Long getStatusId() { return statusId; }
    public void setStatusId(Long statusId) { this.statusId = statusId; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
