package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.UsuarioDTO;
import com.aws.studentbuilder.finance.entity.PapelUsuario;
import com.aws.studentbuilder.finance.entity.StatusUsuario;
import com.aws.studentbuilder.finance.entity.Usuario;
import com.aws.studentbuilder.finance.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EmailNotificationService emailNotificationService;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    @DisplayName("Deve desativar um usuário com sucesso, alterando status para BLOQUEADO e ativo para false")
    void deveDesativarUsuarioComSucesso() {
        Usuario usuario = Usuario.builder()
                .id(1L)
                .nome("Membro Teste")
                .email("membro@teste.com")
                .papel(PapelUsuario.VIEWER)
                .status(StatusUsuario.APROVADO)
                .ativo(true)
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioDTO resultado = usuarioService.desativarUsuario(1L);

        assertNotNull(resultado);
        assertFalse(resultado.isAtivo());
        assertEquals(StatusUsuario.BLOQUEADO, resultado.getStatus());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Deve aprovar um usuário com sucesso, alterando status para APROVADO e ativo para true")
    void deveAprovarUsuarioComSucesso() {
        Usuario usuario = Usuario.builder()
                .id(2L)
                .nome("Novo Membro")
                .email("novo@teste.com")
                .papel(PapelUsuario.VIEWER)
                .status(StatusUsuario.PENDENTE)
                .ativo(false)
                .build();

        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioDTO resultado = usuarioService.aprovarUsuario(2L, PapelUsuario.ADMIN);

        assertNotNull(resultado);
        assertTrue(resultado.isAtivo());
        assertEquals(StatusUsuario.APROVADO, resultado.getStatus());
        assertEquals(PapelUsuario.ADMIN, resultado.getPapel());
        verify(usuarioRepository).save(usuario);
    }
}
