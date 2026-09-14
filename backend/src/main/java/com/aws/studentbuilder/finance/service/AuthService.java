package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.AuthRequest;
import com.aws.studentbuilder.finance.dto.AuthResponse;
import com.aws.studentbuilder.finance.dto.UsuarioDTO;
import com.aws.studentbuilder.finance.entity.PapelUsuario;
import com.aws.studentbuilder.finance.entity.Usuario;
import com.aws.studentbuilder.finance.repository.UsuarioRepository;
import com.aws.studentbuilder.finance.security.GoogleTokenVerifier;
import com.aws.studentbuilder.finance.security.JwtTokenProvider;
import com.aws.studentbuilder.finance.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository usuarioRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.initial-admin-email:admin@studentbuilder.aws}")
    private String initialAdminEmail;

    public AuthService(UsuarioRepository usuarioRepository, GoogleTokenVerifier googleTokenVerifier, JwtTokenProvider tokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.googleTokenVerifier = googleTokenVerifier;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse loginWithGoogle(AuthRequest request) {
        GoogleTokenVerifier.GoogleUserInfo googleUser = googleTokenVerifier.verify(request.getToken());

        if (googleUser == null) {
            throw new IllegalArgumentException("Token do Google inválido ou expirado.");
        }

        Usuario usuario = usuarioRepository.findByGoogleSub(googleUser.sub())
                .or(() -> usuarioRepository.findByEmail(googleUser.email()))
                .map(existing -> {
                    if (existing.getGoogleSub() == null) {
                        existing.setGoogleSub(googleUser.sub());
                    }
                    if (existing.getNome() == null || existing.getNome().isBlank()) {
                        existing.setNome(googleUser.name());
                    }
                    return usuarioRepository.save(existing);
                })
                .orElseGet(() -> {
                    boolean isAdmin = initialAdminEmail.equalsIgnoreCase(googleUser.email());
                    Usuario novo = Usuario.builder()
                            .nome(googleUser.name())
                            .email(googleUser.email())
                            .googleSub(googleUser.sub())
                            .papel(isAdmin ? PapelUsuario.ADMIN : PapelUsuario.VIEWER)
                            .ativo(true)
                            .build();
                    logger.info("Criando novo usuário: {} com papel: {}", novo.getEmail(), novo.getPapel());
                    return usuarioRepository.save(novo);
                });

        if (!usuario.isAtivo()) {
            throw new IllegalStateException("Esta conta está desativada. Entre em contato com a liderança do grupo.");
        }

        UserPrincipal principal = UserPrincipal.create(usuario);
        String jwt = tokenProvider.generateToken(principal);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nome(usuario.getNome())
                .papel(usuario.getPapel())
                .pictureUrl(googleUser.pictureUrl())
                .build();
    }

    public UsuarioDTO toDTO(Usuario usuario) {
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .papel(usuario.getPapel())
                .ativo(usuario.isAtivo())
                .criadoEm(usuario.getCriadoEm())
                .build();
    }
}
