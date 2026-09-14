package com.aws.studentbuilder.finance.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    @NotBlank(message = "Token do Google é obrigatório")
    private String token;

    public AuthRequest() {}

    public AuthRequest(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
