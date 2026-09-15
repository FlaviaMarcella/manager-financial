package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.AuthRequest;
import com.aws.studentbuilder.finance.dto.AuthResponse;
import com.aws.studentbuilder.finance.dto.UsuarioDTO;
import com.aws.studentbuilder.finance.entity.PapelUsuario;
import com.aws.studentbuilder.finance.entity.StatusUsuario;
import com.aws.studentbuilder.finance.entity.Usuario;
import com.aws.studentbuilder.finance.exception.UserAccessDeniedException;
import com.aws.studentbuilder.finance.exception.UserPendingApprovalException;
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
    private final EmailNotificationService emailNotificationService;

    @Value("${app.initial-admin-email:studentbuildergroup@gmail.com}")
    private String initialAdminEmail;

    public AuthService(
            UsuarioRepository usuarioRepository,
            GoogleTokenVerifier googleTokenVerifier,
            JwtTokenProvider tokenProvider,
            EmailNotificationService emailNotificationService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.googleTokenVerifier = googleTokenVerifier;
        this.tokenProvider = tokenProvider;
        this.emailNotificationService = emailNotificationService;
    }

    @Transactional(noRollbackFor = {UserPendingApprovalException.class, UserAccessDeniedException.class})
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
                    boolean isConfiguredAdmin = initialAdminEmail != null && initialAdminEmail.trim().equalsIgnoreCase(googleUser.email().trim());
                    if (isConfiguredAdmin) {
                        existing.setPapel(PapelUsuario.ADMIN);
                        existing.setStatus(StatusUsuario.APROVADO);
                        existing.setAtivo(true);
                    }
                    return usuarioRepository.saveAndFlush(existing);
                })
                .orElseGet(() -> {
                    boolean isFirstUser = usuarioRepository.count() == 0;
                    boolean isConfiguredAdmin = initialAdminEmail != null && initialAdminEmail.trim().equalsIgnoreCase(googleUser.email().trim());
                    boolean isAutoApprovedAdmin = isFirstUser || isConfiguredAdmin;

                    Usuario novo = Usuario.builder()
                            .nome(googleUser.name())
                            .email(googleUser.email())
                            .googleSub(googleUser.sub())
                            .papel(isAutoApprovedAdmin ? PapelUsuario.ADMIN : PapelUsuario.VIEWER)
                            .status(isAutoApprovedAdmin ? StatusUsuario.APROVADO : StatusUsuario.PENDENTE)
                            .ativo(isAutoApprovedAdmin)
                            .build();

                    Usuario salvo = usuarioRepository.saveAndFlush(novo);
                    logger.info("Novo registro de usuário persistido: {} | Papel: {} | Status: {}", salvo.getEmail(), salvo.getPapel(), salvo.getStatus());

                    // Disparo assíncrono de e-mails para solicitações pendentes
                    if (salvo.getStatus() == StatusUsuario.PENDENTE) {
                        try {
                            emailNotificationService.notificarAdminNovaSolicitacao(salvo.getNome(), salvo.getEmail());
                            emailNotificationService.notificarUsuarioSolicitacaoRecebida(salvo.getNome(), salvo.getEmail());
                        } catch (Exception e) {
                            logger.warn("Erro ao agendar envio de e-mails de notificação: {}", e.getMessage());
                        }
                    }

                    return salvo;
                });

        // Verificação do status de aprovação
        if (usuario.getStatus() == StatusUsuario.PENDENTE) {
            logger.warn("Tentativa de login de usuário pendente de aprovação: {}", usuario.getEmail());
            throw new UserPendingApprovalException(usuario.getEmail(), usuario.getNome());
        }

        if (usuario.getStatus() == StatusUsuario.REJEITADO) {
            logger.warn("Tentativa de login de usuário rejeitado: {}", usuario.getEmail());
            throw new UserAccessDeniedException(StatusUsuario.REJEITADO, "Sua solicitação de acesso foi recusada pela administração.");
        }

        if (usuario.getStatus() == StatusUsuario.BLOQUEADO || !usuario.isAtivo()) {
            logger.warn("Tentativa de login de usuário inativo ou bloqueado: {}", usuario.getEmail());
            throw new UserAccessDeniedException(StatusUsuario.BLOQUEADO, "Esta conta está desativada. Entre em contato com a liderança do grupo.");
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
                .status(usuario.getStatus())
                .ativo(usuario.isAtivo())
                .criadoEm(usuario.getCriadoEm())
                .build();
    }
}
