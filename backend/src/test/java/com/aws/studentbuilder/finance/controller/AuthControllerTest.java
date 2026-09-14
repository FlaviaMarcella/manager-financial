package com.aws.studentbuilder.finance.controller;

import com.aws.studentbuilder.finance.dto.AuthRequest;
import com.aws.studentbuilder.finance.dto.AuthResponse;
import com.aws.studentbuilder.finance.entity.PapelUsuario;
import com.aws.studentbuilder.finance.security.JwtAuthFilter;
import com.aws.studentbuilder.finance.security.JwtTokenProvider;
import com.aws.studentbuilder.finance.service.AuthService;
import com.aws.studentbuilder.finance.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("Deve realizar login com Google e retornar token JWT e cookie HttpOnly")
    void deveFazerLoginComGoogle() throws Exception {
        AuthRequest request = new AuthRequest("dev-token:teste@studentbuilder.aws:Teste User");
        AuthResponse response = AuthResponse.builder()
                .token("mocked-jwt-token")
                .type("Bearer")
                .id(1L)
                .email("teste@studentbuilder.aws")
                .nome("Teste User")
                .papel(PapelUsuario.VIEWER)
                .build();

        when(authService.loginWithGoogle(any(AuthRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"))
                .andExpect(jsonPath("$.email").value("teste@studentbuilder.aws"))
                .andExpect(jsonPath("$.papel").value("VIEWER"))
                .andExpect(cookie().exists("auth_token"));
    }
}
