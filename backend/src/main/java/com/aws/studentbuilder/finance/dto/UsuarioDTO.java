package com.aws.studentbuilder.finance.dto;

import com.aws.studentbuilder.finance.entity.PapelUsuario;
import com.aws.studentbuilder.finance.entity.StatusUsuario;
import java.time.OffsetDateTime;

public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private PapelUsuario papel;
    private StatusUsuario status;
    private boolean ativo;
    private OffsetDateTime criadoEm;

    public UsuarioDTO() {}

    public UsuarioDTO(Long id, String nome, String email, PapelUsuario papel, StatusUsuario status, boolean ativo, OffsetDateTime criadoEm) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.papel = papel;
        this.status = status;
        this.ativo = ativo;
        this.criadoEm = criadoEm;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String nome;
        private String email;
        private PapelUsuario papel;
        private StatusUsuario status;
        private boolean ativo;
        private OffsetDateTime criadoEm;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder nome(String nome) { this.nome = nome; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder papel(PapelUsuario papel) { this.papel = papel; return this; }
        public Builder status(StatusUsuario status) { this.status = status; return this; }
        public Builder ativo(boolean ativo) { this.ativo = ativo; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public UsuarioDTO build() { return new UsuarioDTO(id, nome, email, papel, status, ativo, criadoEm); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public PapelUsuario getPapel() { return papel; }
    public void setPapel(PapelUsuario papel) { this.papel = papel; }
    public StatusUsuario getStatus() { return status; }
    public void setStatus(StatusUsuario status) { this.status = status; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
