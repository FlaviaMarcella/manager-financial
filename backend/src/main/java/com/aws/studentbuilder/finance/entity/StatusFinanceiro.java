package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "status_financeiro")
public class StatusFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nome;

    @Column(name = "cor_badge", length = 50)
    private String corBadge = "#41B3FF";

    public StatusFinanceiro() {}

    public StatusFinanceiro(Long id, String nome, String corBadge) {
        this.id = id;
        this.nome = nome;
        this.corBadge = corBadge != null ? corBadge : "#41B3FF";
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String nome;
        private String corBadge = "#41B3FF";

        public Builder id(Long id) { this.id = id; return this; }
        public Builder nome(String nome) { this.nome = nome; return this; }
        public Builder corBadge(String corBadge) { this.corBadge = corBadge; return this; }
        public StatusFinanceiro build() { return new StatusFinanceiro(id, nome, corBadge); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCorBadge() { return corBadge; }
    public void setCorBadge(String corBadge) { this.corBadge = corBadge; }
}
