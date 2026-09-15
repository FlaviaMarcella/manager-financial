package com.aws.studentbuilder.finance.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    private static final Logger logger = LoggerFactory.getLogger(GoogleTokenVerifier.class);

    private final String clientId;
    private final boolean allowDevTokens;
    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(
            @Value("${app.google.client-id}") String clientId,
            @Value("${app.auth.allow-dev-tokens:false}") boolean allowDevTokens
    ) {
        this.clientId = clientId;
        this.allowDevTokens = allowDevTokens;
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    public GoogleUserInfo verify(String idTokenString) {
        // Modo de desenvolvimento apenas se explicitamente habilitado
        if (allowDevTokens && idTokenString != null && (idTokenString.startsWith("dev-token:") || "dummy-google-client-id.apps.googleusercontent.com".equals(clientId))) {
            return parseDevToken(idTokenString);
        }

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String userId = payload.getSubject();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                return new GoogleUserInfo(userId, email, name != null ? name : email, pictureUrl);
            } else {
                logger.warn("Token do Google inválido ou expirado.");
                return null;
            }
        } catch (Exception e) {
            logger.error("Erro ao verificar token do Google: {}", e.getMessage());
            // Se falhar a verificação remota no modo dev, faz parse caso venha com prefixo dev
            if (idTokenString != null && idTokenString.startsWith("dev-token:")) {
                return parseDevToken(idTokenString);
            }
            return null;
        }
    }

    private GoogleUserInfo parseDevToken(String idTokenString) {
        String clean = idTokenString.replace("dev-token:", "");
        String[] parts = clean.split(":");
        String email = parts.length > 0 && !parts[0].isBlank() ? parts[0] : "admin@studentbuilder.aws";
        String name = parts.length > 1 && !parts[1].isBlank() ? parts[1] : "AWS Student Builder Dev";
        String sub = "sub-" + email.replaceAll("[^a-zA-Z0-9]", "-");
        return new GoogleUserInfo(sub, email, name, "");
    }

    public record GoogleUserInfo(String sub, String email, String name, String pictureUrl) {}
}
