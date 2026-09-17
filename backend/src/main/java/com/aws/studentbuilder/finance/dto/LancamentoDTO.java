package com.aws.studentbuilder.finance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class LancamentoDTO {
    private Long id;
    private LocalDate data;
    private String descricao;
    private String fornecedor;
    private String numeroNotaFiscal;
    private Long eventoId;
    private String eventoNome;
    private Long categoriaId;
    private String categoriaNome;
    private BigDecimal valorUsd;
    private BigDecimal valorBrl;
    private BigDecimal taxaCambioUsada;
    private String formaPagamento;
    private Long statusId;
    private String statusNome;
    private String statusCorBadge;
    private Long responsavelId;
    private String responsavelNome;
    private String anexoUrl;
    private String anexoNomeOriginal;
    private List<LancamentoAnexoDTO> anexos = new ArrayList<>();
    private String observacoes;
    private OffsetDateTime criadoEm;

    public LancamentoDTO() {}

    public LancamentoDTO(Long id, LocalDate data, String descricao, String fornecedor, String numeroNotaFiscal,
                         Long eventoId, String eventoNome, Long categoriaId, String categoriaNome,
                         BigDecimal valorUsd, BigDecimal valorBrl, BigDecimal taxaCambioUsada,
                         String formaPagamento, Long statusId, String statusNome, String statusCorBadge,
                         Long responsavelId, String responsavelNome, String anexoUrl,
                         String anexoNomeOriginal, List<LancamentoAnexoDTO> anexos, String observacoes, OffsetDateTime criadoEm) {
        this.id = id;
        this.data = data;
        this.descricao = descricao;
        this.fornecedor = fornecedor;
        this.numeroNotaFiscal = numeroNotaFiscal;
        this.eventoId = eventoId;
        this.eventoNome = eventoNome;
        this.categoriaId = categoriaId;
        this.categoriaNome = categoriaNome;
        this.valorUsd = valorUsd;
        this.valorBrl = valorBrl;
        this.taxaCambioUsada = taxaCambioUsada;
        this.formaPagamento = formaPagamento;
        this.statusId = statusId;
        this.statusNome = statusNome;
        this.statusCorBadge = statusCorBadge;
        this.responsavelId = responsavelId;
        this.responsavelNome = responsavelNome;
        this.anexoUrl = anexoUrl;
        this.anexoNomeOriginal = anexoNomeOriginal;
        if (anexos != null) this.anexos = anexos;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private LocalDate data;
        private String descricao;
        private String fornecedor;
        private String numeroNotaFiscal;
        private Long eventoId;
        private String eventoNome;
        private Long categoriaId;
        private String categoriaNome;
        private BigDecimal valorUsd;
        private BigDecimal valorBrl;
        private BigDecimal taxaCambioUsada;
        private String formaPagamento;
        private Long statusId;
        private String statusNome;
        private String statusCorBadge;
        private Long responsavelId;
        private String responsavelNome;
        private String anexoUrl;
        private String anexoNomeOriginal;
        private List<LancamentoAnexoDTO> anexos = new ArrayList<>();
        private String observacoes;
        private OffsetDateTime criadoEm;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder data(LocalDate data) { this.data = data; return this; }
        public Builder descricao(String descricao) { this.descricao = descricao; return this; }
        public Builder fornecedor(String fornecedor) { this.fornecedor = fornecedor; return this; }
        public Builder numeroNotaFiscal(String numeroNotaFiscal) { this.numeroNotaFiscal = numeroNotaFiscal; return this; }
        public Builder eventoId(Long eventoId) { this.eventoId = eventoId; return this; }
        public Builder eventoNome(String eventoNome) { this.eventoNome = eventoNome; return this; }
        public Builder categoriaId(Long categoriaId) { this.categoriaId = categoriaId; return this; }
        public Builder categoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; return this; }
        public Builder valorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; return this; }
        public Builder valorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; return this; }
        public Builder taxaCambioUsada(BigDecimal taxaCambioUsada) { this.taxaCambioUsada = taxaCambioUsada; return this; }
        public Builder formaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; return this; }
        public Builder statusId(Long statusId) { this.statusId = statusId; return this; }
        public Builder statusNome(String statusNome) { this.statusNome = statusNome; return this; }
        public Builder statusCorBadge(String statusCorBadge) { this.statusCorBadge = statusCorBadge; return this; }
        public Builder responsavelId(Long responsavelId) { this.responsavelId = responsavelId; return this; }
        public Builder responsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; return this; }
        public Builder anexoUrl(String anexoUrl) { this.anexoUrl = anexoUrl; return this; }
        public Builder anexoNomeOriginal(String anexoNomeOriginal) { this.anexoNomeOriginal = anexoNomeOriginal; return this; }
        public Builder anexos(List<LancamentoAnexoDTO> anexos) { this.anexos = anexos; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public LancamentoDTO build() {
            return new LancamentoDTO(id, data, descricao, fornecedor, numeroNotaFiscal, eventoId, eventoNome, categoriaId, categoriaNome, valorUsd, valorBrl, taxaCambioUsada, formaPagamento, statusId, statusNome, statusCorBadge, responsavelId, responsavelNome, anexoUrl, anexoNomeOriginal, anexos, observacoes, criadoEm);
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
    public Long getEventoId() { return eventoId; }
    public void setEventoId(Long eventoId) { this.eventoId = eventoId; }
    public String getEventoNome() { return eventoNome; }
    public void setEventoNome(String eventoNome) { this.eventoNome = eventoNome; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public String getCategoriaNome() { return categoriaNome; }
    public void setCategoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; }
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
    public String getStatusNome() { return statusNome; }
    public void setStatusNome(String statusNome) { this.statusNome = statusNome; }
    public String getStatusCorBadge() { return statusCorBadge; }
    public void setStatusCorBadge(String statusCorBadge) { this.statusCorBadge = statusCorBadge; }
    public Long getResponsavelId() { return responsavelId; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }
    public String getResponsavelNome() { return responsavelNome; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }
    public String getAnexoUrl() { return anexoUrl; }
    public void setAnexoUrl(String anexoUrl) { this.anexoUrl = anexoUrl; }
    public String getAnexoNomeOriginal() { return anexoNomeOriginal; }
    public void setAnexoNomeOriginal(String anexoNomeOriginal) { this.anexoNomeOriginal = anexoNomeOriginal; }
    public List<LancamentoAnexoDTO> getAnexos() { return anexos; }
    public void setAnexos(List<LancamentoAnexoDTO> anexos) { this.anexos = anexos; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
