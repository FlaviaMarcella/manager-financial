package com.aws.studentbuilder.finance.dto;

import com.aws.studentbuilder.finance.entity.PapelUsuario;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String nome;
    private PapelUsuario papel;
    private String pictureUrl;

    public AuthResponse() {}

    public AuthResponse(String token, String type, Long id, String email, String nome, PapelUsuario papel, String pictureUrl) {
        this.token = token;
        this.type = type != null ? type : "Bearer";
        this.id = id;
        this.email = email;
        this.nome = nome;
        this.papel = papel;
        this.pictureUrl = pictureUrl;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String email;
        private String nome;
        private PapelUsuario papel;
        private String pictureUrl;

        public Builder token(String token) { this.token = token; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder id(Long id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder nome(String nome) { this.nome = nome; return this; }
        public Builder papel(PapelUsuario papel) { this.papel = papel; return this; }
        public Builder pictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; return this; }
        public AuthResponse build() { return new AuthResponse(token, type, id, email, nome, papel, pictureUrl); }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public PapelUsuario getPapel() { return papel; }
    public void setPapel(PapelUsuario papel) { this.papel = papel; }
    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }
}
