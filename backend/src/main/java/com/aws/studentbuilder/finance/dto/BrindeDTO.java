package com.aws.studentbuilder.finance.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class BrindeDTO {
    private Long id;
    private String item;
    private Long origemParceriaId;
    private String origemParceiroNome;
    private Integer qtdRecebida;
    private Integer qtdDistribuida;
    private Integer saldoEstoque;
    private Long eventoDistribuicaoId;
    private String eventoDistribuicaoNome;
    private LocalDate dataDistribuicao;
    private String observacoes;
    private OffsetDateTime criadoEm;

    public BrindeDTO() {}

    public BrindeDTO(Long id, String item, Long origemParceriaId, String origemParceiroNome,
                     Integer qtdRecebida, Integer qtdDistribuida, Integer saldoEstoque,
                     Long eventoDistribuicaoId, String eventoDistribuicaoNome,
                     LocalDate dataDistribuicao, String observacoes, OffsetDateTime criadoEm) {
        this.id = id;
        this.item = item;
        this.origemParceriaId = origemParceriaId;
        this.origemParceiroNome = origemParceiroNome;
        this.qtdRecebida = qtdRecebida;
        this.qtdDistribuida = qtdDistribuida;
        this.saldoEstoque = saldoEstoque;
        this.eventoDistribuicaoId = eventoDistribuicaoId;
        this.eventoDistribuicaoNome = eventoDistribuicaoNome;
        this.dataDistribuicao = dataDistribuicao;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String item;
        private Long origemParceriaId;
        private String origemParceiroNome;
        private Integer qtdRecebida;
        private Integer qtdDistribuida;
        private Integer saldoEstoque;
        private Long eventoDistribuicaoId;
        private String eventoDistribuicaoNome;
        private LocalDate dataDistribuicao;
        private String observacoes;
        private OffsetDateTime criadoEm;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder item(String item) { this.item = item; return this; }
        public Builder origemParceriaId(Long origemParceriaId) { this.origemParceriaId = origemParceriaId; return this; }
        public Builder origemParceiroNome(String origemParceiroNome) { this.origemParceiroNome = origemParceiroNome; return this; }
        public Builder qtdRecebida(Integer qtdRecebida) { this.qtdRecebida = qtdRecebida; return this; }
        public Builder qtdDistribuida(Integer qtdDistribuida) { this.qtdDistribuida = qtdDistribuida; return this; }
        public Builder saldoEstoque(Integer saldoEstoque) { this.saldoEstoque = saldoEstoque; return this; }
        public Builder eventoDistribuicaoId(Long eventoDistribuicaoId) { this.eventoDistribuicaoId = eventoDistribuicaoId; return this; }
        public Builder eventoDistribuicaoNome(String eventoDistribuicaoNome) { this.eventoDistribuicaoNome = eventoDistribuicaoNome; return this; }
        public Builder dataDistribuicao(LocalDate dataDistribuicao) { this.dataDistribuicao = dataDistribuicao; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public BrindeDTO build() {
            return new BrindeDTO(id, item, origemParceriaId, origemParceiroNome, qtdRecebida, qtdDistribuida, saldoEstoque, eventoDistribuicaoId, eventoDistribuicaoNome, dataDistribuicao, observacoes, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }
    public Long getOrigemParceriaId() { return origemParceriaId; }
    public void setOrigemParceriaId(Long origemParceriaId) { this.origemParceriaId = origemParceriaId; }
    public String getOrigemParceiroNome() { return origemParceiroNome; }
    public void setOrigemParceiroNome(String origemParceiroNome) { this.origemParceiroNome = origemParceiroNome; }
    public Integer getQtdRecebida() { return qtdRecebida; }
    public void setQtdRecebida(Integer qtdRecebida) { this.qtdRecebida = qtdRecebida; }
    public Integer getQtdDistribuida() { return qtdDistribuida; }
    public void setQtdDistribuida(Integer qtdDistribuida) { this.qtdDistribuida = qtdDistribuida; }
    public Integer getSaldoEstoque() { return saldoEstoque; }
    public void setSaldoEstoque(Integer saldoEstoque) { this.saldoEstoque = saldoEstoque; }
    public Long getEventoDistribuicaoId() { return eventoDistribuicaoId; }
    public void setEventoDistribuicaoId(Long eventoDistribuicaoId) { this.eventoDistribuicaoId = eventoDistribuicaoId; }
    public String getEventoDistribuicaoNome() { return eventoDistribuicaoNome; }
    public void setEventoDistribuicaoNome(String eventoDistribuicaoNome) { this.eventoDistribuicaoNome = eventoDistribuicaoNome; }
    public LocalDate getDataDistribuicao() { return dataDistribuicao; }
    public void setDataDistribuicao(LocalDate dataDistribuicao) { this.dataDistribuicao = dataDistribuicao; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
