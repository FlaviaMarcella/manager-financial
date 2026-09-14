package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.StatusFinanceiroDTO;
import com.aws.studentbuilder.finance.entity.StatusFinanceiro;
import com.aws.studentbuilder.finance.repository.StatusFinanceiroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StatusFinanceiroService {

    private final StatusFinanceiroRepository statusFinanceiroRepository;

    public StatusFinanceiroService(StatusFinanceiroRepository statusFinanceiroRepository) {
        this.statusFinanceiroRepository = statusFinanceiroRepository;
    }

    @Transactional(readOnly = true)
    public List<StatusFinanceiroDTO> listarTodos() {
        return statusFinanceiroRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public StatusFinanceiroDTO buscarPorId(Long id) {
        StatusFinanceiro status = statusFinanceiroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Status financeiro não encontrado com ID: " + id));
        return toDTO(status);
    }

    @Transactional
    public StatusFinanceiroDTO criar(StatusFinanceiroDTO dto) {
        statusFinanceiroRepository.findByNomeIgnoreCase(dto.getNome().trim()).ifPresent(s -> {
            throw new IllegalArgumentException("Já existe um status financeiro com este nome: " + dto.getNome());
        });

        StatusFinanceiro status = StatusFinanceiro.builder()
                .nome(dto.getNome().trim())
                .corBadge(dto.getCorBadge() != null ? dto.getCorBadge() : "#41B3FF")
                .build();
        return toDTO(statusFinanceiroRepository.save(status));
    }

    @Transactional
    public StatusFinanceiroDTO atualizar(Long id, StatusFinanceiroDTO dto) {
        StatusFinanceiro status = statusFinanceiroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Status financeiro não encontrado com ID: " + id));

        statusFinanceiroRepository.findByNomeIgnoreCase(dto.getNome().trim()).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new IllegalArgumentException("Já existe outro status financeiro com este nome: " + dto.getNome());
            }
        });

        status.setNome(dto.getNome().trim());
        if (dto.getCorBadge() != null) {
            status.setCorBadge(dto.getCorBadge());
        }
        return toDTO(statusFinanceiroRepository.save(status));
    }

    @Transactional
    public void deletar(Long id) {
        if (!statusFinanceiroRepository.existsById(id)) {
            throw new IllegalArgumentException("Status financeiro não encontrado com ID: " + id);
        }
        statusFinanceiroRepository.deleteById(id);
    }

    public StatusFinanceiroDTO toDTO(StatusFinanceiro s) {
        return StatusFinanceiroDTO.builder()
                .id(s.getId())
                .nome(s.getNome())
                .corBadge(s.getCorBadge())
                .build();
    }
}
