package com.aws.studentbuilder.finance.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class CotacaoDolarDTO {
    private BigDecimal cotacaoOficial;
    private BigDecimal maximo;
    private BigDecimal minimo;
    private BigDecimal variacao;
    private BigDecimal pctChange;
    private String dataHoraCotacao;
    private String fonte;

    public CotacaoDolarDTO() {}

    public CotacaoDolarDTO(BigDecimal cotacaoOficial, BigDecimal maximo, BigDecimal minimo,
                           BigDecimal variacao, BigDecimal pctChange, String dataHoraCotacao, String fonte) {
        this.cotacaoOficial = cotacaoOficial;
        this.maximo = maximo;
        this.minimo = minimo;
        this.variacao = variacao;
        this.pctChange = pctChange;
        this.dataHoraCotacao = dataHoraCotacao;
        this.fonte = fonte;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private BigDecimal cotacaoOficial;
        private BigDecimal maximo;
        private BigDecimal minimo;
        private BigDecimal variacao;
        private BigDecimal pctChange;
        private String dataHoraCotacao;
        private String fonte;

        public Builder cotacaoOficial(BigDecimal cotacaoOficial) { this.cotacaoOficial = cotacaoOficial; return this; }
        public Builder maximo(BigDecimal maximo) { this.maximo = maximo; return this; }
        public Builder minimo(BigDecimal minimo) { this.minimo = minimo; return this; }
        public Builder variacao(BigDecimal variacao) { this.variacao = variacao; return this; }
        public Builder pctChange(BigDecimal pctChange) { this.pctChange = pctChange; return this; }
        public Builder dataHoraCotacao(String dataHoraCotacao) { this.dataHoraCotacao = dataHoraCotacao; return this; }
        public Builder fonte(String fonte) { this.fonte = fonte; return this; }
        public CotacaoDolarDTO build() {
            return new CotacaoDolarDTO(cotacaoOficial, maximo, minimo, variacao, pctChange, dataHoraCotacao, fonte);
        }
    }

    public BigDecimal getCotacaoOficial() { return cotacaoOficial; }
    public void setCotacaoOficial(BigDecimal cotacaoOficial) { this.cotacaoOficial = cotacaoOficial; }

    public BigDecimal getMaximo() { return maximo; }
    public void setMaximo(BigDecimal maximo) { this.maximo = maximo; }

    public BigDecimal getMinimo() { return minimo; }
    public void setMinimo(BigDecimal minimo) { this.minimo = minimo; }

    public BigDecimal getVariacao() { return variacao; }
    public void setVariacao(BigDecimal variacao) { this.variacao = variacao; }

    public BigDecimal getPctChange() { return pctChange; }
    public void setPctChange(BigDecimal pctChange) { this.pctChange = pctChange; }

    public String getDataHoraCotacao() { return dataHoraCotacao; }
    public void setDataHoraCotacao(String dataHoraCotacao) { this.dataHoraCotacao = dataHoraCotacao; }

    public String getFonte() { return fonte; }
    public void setFonte(String fonte) { this.fonte = fonte; }
}
