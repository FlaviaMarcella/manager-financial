package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.AuthRequest;
import com.aws.studentbuilder.finance.dto.AuthResponse;
import com.aws.studentbuilder.finance.dto.UsuarioDTO;
import com.aws.studentbuilder.finance.security.SecurityUtils;
import com.aws.studentbuilder.finance.service.AuthService;
import com.aws.studentbuilder.finance.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação", description = "Endpoints de login social Google e sessão JWT")
public class AuthController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    public AuthController(AuthService authService, UsuarioService usuarioService) {
        this.authService = authService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/google")
    @Operation(summary = "Login com token do Google", description = "Valida o token Google ID e retorna JWT e dados do usuário")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.loginWithGoogle(request);

        // Criar cookie HttpOnly para segurança extra
        ResponseCookie cookie = ResponseCookie.from("auth_token", authResponse.getToken())
                .httpOnly(true)
                .secure(false) // Permitir HTTP localmente, em produção com HTTPS mudar para true
                .path("/")
                .maxAge(Duration.ofDays(1))
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/me")
    @Operation(summary = "Dados do usuário autenticado")
    public ResponseEntity<UsuarioDTO> getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("Nenhum usuário autenticado encontrado"));
        return ResponseEntity.ok(usuarioService.buscarPorId(userId));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout da aplicação")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }
}
