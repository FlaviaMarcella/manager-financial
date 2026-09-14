package com.aws.studentbuilder.finance.dto;

import com.aws.studentbuilder.finance.entity.PapelUsuario;
import jakarta.validation.constraints.NotNull;

public class UpdateUsuarioRoleRequest {
    @NotNull(message = "Papel é obrigatório")
    private PapelUsuario papel;
    private Boolean ativo;

    public UpdateUsuarioRoleRequest() {}

    public UpdateUsuarioRoleRequest(PapelUsuario papel, Boolean ativo) {
        this.papel = papel;
        this.ativo = ativo;
    }

    public PapelUsuario getPapel() { return papel; }
    public void setPapel(PapelUsuario papel) { this.papel = papel; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
