package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "brindes")
public class Brinde {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origem_parceria_id")
    private Parceria origemParceria;

    @Column(name = "qtd_recebida", nullable = false)
    private Integer qtdRecebida = 0;

    @Column(name = "qtd_distribuida", nullable = false)
    private Integer qtdDistribuida = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_distribuicao_id")
    private Evento eventoDistribuicao;

    @Column(name = "data_distribuicao")
    private LocalDate dataDistribuicao;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    public Brinde() {}

    public Brinde(Long id, String item, Parceria origemParceria, Integer qtdRecebida, Integer qtdDistribuida,
                  Evento eventoDistribuicao, LocalDate dataDistribuicao, String observacoes, OffsetDateTime criadoEm) {
        this.id = id;
        this.item = item;
        this.origemParceria = origemParceria;
        this.qtdRecebida = qtdRecebida != null ? qtdRecebida : 0;
        this.qtdDistribuida = qtdDistribuida != null ? qtdDistribuida : 0;
        this.eventoDistribuicao = eventoDistribuicao;
        this.dataDistribuicao = dataDistribuicao;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm != null ? criadoEm : OffsetDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String item;
        private Parceria origemParceria;
        private Integer qtdRecebida = 0;
        private Integer qtdDistribuida = 0;
        private Evento eventoDistribuicao;
        private LocalDate dataDistribuicao;
        private String observacoes;
        private OffsetDateTime criadoEm = OffsetDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder item(String item) { this.item = item; return this; }
        public Builder origemParceria(Parceria origemParceria) { this.origemParceria = origemParceria; return this; }
        public Builder qtdRecebida(Integer qtdRecebida) { this.qtdRecebida = qtdRecebida; return this; }
        public Builder qtdDistribuida(Integer qtdDistribuida) { this.qtdDistribuida = qtdDistribuida; return this; }
        public Builder eventoDistribuicao(Evento eventoDistribuicao) { this.eventoDistribuicao = eventoDistribuicao; return this; }
        public Builder dataDistribuicao(LocalDate dataDistribuicao) { this.dataDistribuicao = dataDistribuicao; return this; }
        public Builder observacoes(String observacoes) { this.observacoes = observacoes; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public Brinde build() { return new Brinde(id, item, origemParceria, qtdRecebida, qtdDistribuida, eventoDistribuicao, dataDistribuicao, observacoes, criadoEm); }
    }

    public int getSaldoEstoque() {
        return (qtdRecebida != null ? qtdRecebida : 0) - (qtdDistribuida != null ? qtdDistribuida : 0);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }
    public Parceria getOrigemParceria() { return origemParceria; }
    public void setOrigemParceria(Parceria origemParceria) { this.origemParceria = origemParceria; }
    public Integer getQtdRecebida() { return qtdRecebida; }
    public void setQtdRecebida(Integer qtdRecebida) { this.qtdRecebida = qtdRecebida; }
    public Integer getQtdDistribuida() { return qtdDistribuida; }
    public void setQtdDistribuida(Integer qtdDistribuida) { this.qtdDistribuida = qtdDistribuida; }
    public Evento getEventoDistribuicao() { return eventoDistribuicao; }
    public void setEventoDistribuicao(Evento eventoDistribuicao) { this.eventoDistribuicao = eventoDistribuicao; }
    public LocalDate getDataDistribuicao() { return dataDistribuicao; }
    public void setDataDistribuicao(LocalDate dataDistribuicao) { this.dataDistribuicao = dataDistribuicao; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
