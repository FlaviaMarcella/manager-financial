package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.UpdateUsuarioRoleRequest;
import com.aws.studentbuilder.finance.dto.UsuarioDTO;
import com.aws.studentbuilder.finance.entity.PapelUsuario;
import com.aws.studentbuilder.finance.entity.StatusUsuario;
import com.aws.studentbuilder.finance.entity.Usuario;
import com.aws.studentbuilder.finance.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + id));
        return toDTO(usuario);
    }

    @Transactional
    public UsuarioDTO atualizarPapelEStatus(Long id, UpdateUsuarioRoleRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + id));

        if (request.getPapel() != null) {
            usuario.setPapel(request.getPapel());
        }
        if (request.getStatus() != null) {
            usuario.setStatus(request.getStatus());
            usuario.setAtivo(request.getStatus() == StatusUsuario.APROVADO);
        } else if (request.getAtivo() != null) {
            usuario.setAtivo(request.getAtivo());
            if (request.getAtivo()) {
                usuario.setStatus(StatusUsuario.APROVADO);
            } else {
                usuario.setStatus(StatusUsuario.BLOQUEADO);
            }
        }

        Usuario salvo = usuarioRepository.save(usuario);
        return toDTO(salvo);
    }

    @Transactional
    public UsuarioDTO aprovarUsuario(Long id, PapelUsuario papel) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + id));

        usuario.setStatus(StatusUsuario.APROVADO);
        usuario.setAtivo(true);
        if (papel != null) {
            usuario.setPapel(papel);
        }

        return toDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioDTO rejeitarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + id));

        usuario.setStatus(StatusUsuario.REJEITADO);
        usuario.setAtivo(false);

        return toDTO(usuarioRepository.save(usuario));
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
