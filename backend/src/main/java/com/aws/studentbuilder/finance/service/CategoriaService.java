package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.CategoriaDTO;
import com.aws.studentbuilder.finance.entity.Categoria;
import com.aws.studentbuilder.finance.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaDTO> listarTodos() {
        return categoriaRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaDTO buscarPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com ID: " + id));
        return toDTO(categoria);
    }

    @Transactional
    public CategoriaDTO criar(CategoriaDTO dto) {
        categoriaRepository.findByNomeIgnoreCase(dto.getNome().trim()).ifPresent(c -> {
            throw new IllegalArgumentException("Já existe uma categoria com este nome: " + dto.getNome());
        });

        Categoria categoria = Categoria.builder()
                .nome(dto.getNome().trim())
                .descricao(dto.getDescricao())
                .build();
        return toDTO(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaDTO atualizar(Long id, CategoriaDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com ID: " + id));

        categoriaRepository.findByNomeIgnoreCase(dto.getNome().trim()).ifPresent(c -> {
            if (!c.getId().equals(id)) {
                throw new IllegalArgumentException("Já existe outra categoria com este nome: " + dto.getNome());
            }
        });

        categoria.setNome(dto.getNome().trim());
        categoria.setDescricao(dto.getDescricao());
        return toDTO(categoriaRepository.save(categoria));
    }

    @Transactional
    public void deletar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new IllegalArgumentException("Categoria não encontrada com ID: " + id);
        }
        categoriaRepository.deleteById(id);
    }

    public CategoriaDTO toDTO(Categoria c) {
        return CategoriaDTO.builder()
                .id(c.getId())
                .nome(c.getNome())
                .descricao(c.getDescricao())
                .build();
    }
}
