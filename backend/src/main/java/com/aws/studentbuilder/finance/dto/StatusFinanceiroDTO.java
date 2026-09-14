package com.aws.studentbuilder.finance.dto;

import jakarta.validation.constraints.NotBlank;

public class StatusFinanceiroDTO {
    private Long id;

    @NotBlank(message = "Nome do status é obrigatório")
    private String nome;

    private String corBadge = "#41B3FF";

    public StatusFinanceiroDTO() {}

    public StatusFinanceiroDTO(Long id, String nome, String corBadge) {
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
        public StatusFinanceiroDTO build() { return new StatusFinanceiroDTO(id, nome, corBadge); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCorBadge() { return corBadge; }
    public void setCorBadge(String corBadge) { this.corBadge = corBadge; }
}
