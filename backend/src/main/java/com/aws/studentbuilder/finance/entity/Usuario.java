package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "google_sub", unique = true)
    private String googleSub;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PapelUsuario papel = PapelUsuario.VIEWER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StatusUsuario status = StatusUsuario.PENDENTE;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    public Usuario() {}

    public Usuario(Long id, String nome, String email, String googleSub, PapelUsuario papel, StatusUsuario status, boolean ativo, OffsetDateTime criadoEm) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.googleSub = googleSub;
        this.papel = papel != null ? papel : PapelUsuario.VIEWER;
        this.status = status != null ? status : StatusUsuario.PENDENTE;
        this.ativo = ativo;
        this.criadoEm = criadoEm != null ? criadoEm : OffsetDateTime.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String nome;
        private String email;
        private String googleSub;
        private PapelUsuario papel = PapelUsuario.VIEWER;
        private StatusUsuario status = StatusUsuario.PENDENTE;
        private boolean ativo = true;
        private OffsetDateTime criadoEm = OffsetDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder nome(String nome) { this.nome = nome; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder googleSub(String googleSub) { this.googleSub = googleSub; return this; }
        public Builder papel(PapelUsuario papel) { this.papel = papel; return this; }
        public Builder status(StatusUsuario status) { this.status = status; return this; }
        public Builder ativo(boolean ativo) { this.ativo = ativo; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public Usuario build() {
            return new Usuario(id, nome, email, googleSub, papel, status, ativo, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGoogleSub() { return googleSub; }
    public void setGoogleSub(String googleSub) { this.googleSub = googleSub; }
    public PapelUsuario getPapel() { return papel; }
    public void setPapel(PapelUsuario papel) { this.papel = papel; }
    public StatusUsuario getStatus() { return status; }
    public void setStatus(StatusUsuario status) { this.status = status; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
