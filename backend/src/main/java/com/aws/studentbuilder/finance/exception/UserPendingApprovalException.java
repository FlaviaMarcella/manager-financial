package com.aws.studentbuilder.finance.exception;

public class UserPendingApprovalException extends RuntimeException {
    private final String email;
    private final String nome;

    public UserPendingApprovalException(String email, String nome) {
        super("Sua solicitacao de acesso foi registrada e esta aguardando aprovacao de um Administrador.");
        this.email = email;
        this.nome = nome;
    }

    public String getEmail() { return email; }
    public String getNome() { return nome; }
}