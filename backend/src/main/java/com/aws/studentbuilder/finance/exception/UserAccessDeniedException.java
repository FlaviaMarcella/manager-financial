package com.aws.studentbuilder.finance.exception;

import com.aws.studentbuilder.finance.entity.StatusUsuario;

public class UserAccessDeniedException extends RuntimeException {
    private final StatusUsuario status;

    public UserAccessDeniedException(StatusUsuario status, String message) {
        super(message);
        this.status = status;
    }

    public StatusUsuario getStatus() { return status; }
}