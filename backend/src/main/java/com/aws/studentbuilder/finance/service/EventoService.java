package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.EventoDTO;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;

    public EventoService(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    @Transactional(readOnly = true)
    public List<EventoDTO> listarTodos() {
        return eventoRepository.findAllByOrderByDataDesc().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventoDTO buscarPorId(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));
        return toDTO(evento);
    }

    @Transactional
    public EventoDTO criar(EventoDTO dto) {
        Evento evento = Evento.builder()
                .nome(dto.getNome())
                .data(dto.getData())
                .status(dto.getStatus())
                .build();
        return toDTO(eventoRepository.save(evento));
    }

    @Transactional
    public EventoDTO atualizar(Long id, EventoDTO dto) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));
        evento.setNome(dto.getNome());
        evento.setData(dto.getData());
        if (dto.getStatus() != null) {
            evento.setStatus(dto.getStatus());
        }
        return toDTO(eventoRepository.save(evento));
    }

    @Transactional
    public void deletar(Long id) {
        if (!eventoRepository.existsById(id)) {
            throw new IllegalArgumentException("Evento não encontrado com ID: " + id);
        }
        eventoRepository.deleteById(id);
    }

    public EventoDTO toDTO(Evento e) {
        return EventoDTO.builder()
                .id(e.getId())
                .nome(e.getNome())
                .data(e.getData())
                .status(e.getStatus())
                .build();
    }
}
