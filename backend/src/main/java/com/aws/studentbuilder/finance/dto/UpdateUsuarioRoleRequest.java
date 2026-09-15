package com.aws.studentbuilder.finance.dto;

import com.aws.studentbuilder.finance.entity.PapelUsuario;
import com.aws.studentbuilder.finance.entity.StatusUsuario;

public class UpdateUsuarioRoleRequest {
    private PapelUsuario papel;
    private StatusUsuario status;
    private Boolean ativo;

    public UpdateUsuarioRoleRequest() {}

    public UpdateUsuarioRoleRequest(PapelUsuario papel, StatusUsuario status, Boolean ativo) {
        this.papel = papel;
        this.status = status;
        this.ativo = ativo;
    }

    public PapelUsuario getPapel() { return papel; }
    public void setPapel(PapelUsuario papel) { this.papel = papel; }
    public StatusUsuario getStatus() { return status; }
    public void setStatus(StatusUsuario status) { this.status = status; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
