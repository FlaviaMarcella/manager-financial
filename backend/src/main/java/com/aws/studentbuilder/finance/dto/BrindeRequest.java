package com.aws.studentbuilder.finance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BrindeRequest {
    @NotBlank(message = "Nome do item é obrigatório")
    private String item;

    private Long origemParceriaId;

    @NotNull(message = "Quantidade recebida é obrigatória")
    @Min(value = 0, message = "Quantidade recebida deve ser maior ou igual a zero")
    private Integer qtdRecebida;

    @NotNull(message = "Quantidade distribuída é obrigatória")
    @Min(value = 0, message = "Quantidade distribuída deve ser maior ou igual a zero")
    private Integer qtdDistribuida;

    private Long eventoDistribuicaoId;
    private LocalDate dataDistribuicao;
    private String observacoes;

    public BrindeRequest() {}

    public BrindeRequest(String item, Long origemParceriaId, Integer qtdRecebida, Integer qtdDistribuida,
                         Long eventoDistribuicaoId, LocalDate dataDistribuicao, String observacoes) {
        this.item = item;
        this.origemParceriaId = origemParceriaId;
        this.qtdRecebida = qtdRecebida;
        this.qtdDistribuida = qtdDistribuida;
        this.eventoDistribuicaoId = eventoDistribuicaoId;
        this.dataDistribuicao = dataDistribuicao;
        this.observacoes = observacoes;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String item;
        private Long origemParceriaId;
        private Integer qtdRecebida;
        private Integer qtdDistribuida;
        private Long eventoDistribuicaoId;
        private LocalDate dataDistribuicao;
        private String observacoes;

        public Builder item(String item) { this.item = item; return this; }
        public Builder origemParceriaId(Long origemParceriaId) { this.origemParceriaId = origemParceriaId; return this; }
        public Builder qtdRecebida(Integer qtdRecebida) { this.qtdRecebida = qtdRecebida; return this; }
        public Builder qtdDistribuida(Integer qtdDistribuida) { this.qtdDistribuida = qtdDistribuida; return this; }
        public Builder eventoDistribuicaoId(Long eventoDistribuicaoId) { this.eventoDistribuicaoId = eventoDistribuicaoId; return this; }
        public Builder dataDistribuicao(LocalDate dataDistribuicao) { this.dataDistribuicao = dataDistribuicao; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public BrindeRequest build() {
            return new BrindeRequest(item, origemParceriaId, qtdRecebida, qtdDistribuida, eventoDistribuicaoId, dataDistribuicao, observacoes);
        }
    }

    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }
    public Long getOrigemParceriaId() { return origemParceriaId; }
    public void setOrigemParceriaId(Long origemParceriaId) { this.origemParceriaId = origemParceriaId; }
    public Integer getQtdRecebida() { return qtdRecebida; }
    public void setQtdRecebida(Integer qtdRecebida) { this.qtdRecebida = qtdRecebida; }
    public Integer getQtdDistribuida() { return qtdDistribuida; }
    public void setQtdDistribuida(Integer qtdDistribuida) { this.qtdDistribuida = qtdDistribuida; }
    public Long getEventoDistribuicaoId() { return eventoDistribuicaoId; }
    public void setEventoDistribuicaoId(Long eventoDistribuicaoId) { this.eventoDistribuicaoId = eventoDistribuicaoId; }
    public LocalDate getDataDistribuicao() { return dataDistribuicao; }
    public void setDataDistribuicao(LocalDate dataDistribuicao) { this.dataDistribuicao = dataDistribuicao; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
