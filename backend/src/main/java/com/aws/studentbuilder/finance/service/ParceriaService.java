package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.ParceriaDTO;
import com.aws.studentbuilder.finance.dto.ParceriaRequest;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.Parceria;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.ParceriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ParceriaService {

    private final ParceriaRepository parceriaRepository;
    private final EventoRepository eventoRepository;

    public ParceriaService(ParceriaRepository parceriaRepository, EventoRepository eventoRepository) {
        this.parceriaRepository = parceriaRepository;
        this.eventoRepository = eventoRepository;
    }

    @Transactional(readOnly = true)
    public List<ParceriaDTO> listar(Long eventoId) {
        List<Parceria> parcerias = (eventoId != null)
                ? parceriaRepository.findByEventoId(eventoId)
                : parceriaRepository.findAll();

        return parcerias.stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ParceriaDTO buscarPorId(Long id) {
        Parceria parceria = parceriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parceria não encontrada com ID: " + id));
        return toDTO(parceria);
    }

    @Transactional
    public ParceriaDTO criar(ParceriaRequest request) {
        Evento evento = null;
        if (request.getEventoId() != null) {
            evento = eventoRepository.findById(request.getEventoId()).orElse(null);
        }

        Parceria parceria = Parceria.builder()
                .parceiro(request.getParceiro())
                .tipo(request.getTipo())
                .valorContrapartida(request.getValorContrapartida() != null ? request.getValorContrapartida() : BigDecimal.ZERO)
                .itensRecebidos(request.getItensRecebidos())
                .evento(evento)
                .status(request.getStatus())
                .contato(request.getContato())
                .observacoes(request.getObservacoes())
                .build();

        return toDTO(parceriaRepository.save(parceria));
    }

    @Transactional
    public ParceriaDTO atualizar(Long id, ParceriaRequest request) {
        Parceria parceria = parceriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parceria não encontrada com ID: " + id));

        Evento evento = null;
        if (request.getEventoId() != null) {
            evento = eventoRepository.findById(request.getEventoId()).orElse(null);
        }

        parceria.setParceiro(request.getParceiro());
        parceria.setTipo(request.getTipo());
        parceria.setValorContrapartida(request.getValorContrapartida() != null ? request.getValorContrapartida() : BigDecimal.ZERO);
        parceria.setItensRecebidos(request.getItensRecebidos());
        parceria.setEvento(evento);
        parceria.setStatus(request.getStatus());
        parceria.setContato(request.getContato());
        parceria.setObservacoes(request.getObservacoes());

        return toDTO(parceriaRepository.save(parceria));
    }

    @Transactional
    public void deletar(Long id) {
        if (!parceriaRepository.existsById(id)) {
            throw new IllegalArgumentException("Parceria não encontrada com ID: " + id);
        }
        parceriaRepository.deleteById(id);
    }

    public ParceriaDTO toDTO(Parceria p) {
        return ParceriaDTO.builder()
                .id(p.getId())
                .parceiro(p.getParceiro())
                .tipo(p.getTipo())
                .valorContrapartida(p.getValorContrapartida())
                .itensRecebidos(p.getItensRecebidos())
                .eventoId(p.getEvento() != null ? p.getEvento().getId() : null)
                .eventoNome(p.getEvento() != null ? p.getEvento().getNome() : "Sem evento vinculado")
                .status(p.getStatus())
                .contato(p.getContato())
                .observacoes(p.getObservacoes())
                .criadoEm(p.getCriadoEm())
                .build();
    }
}
