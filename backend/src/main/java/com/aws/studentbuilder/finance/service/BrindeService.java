package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.BrindeDTO;
import com.aws.studentbuilder.finance.dto.BrindeRequest;
import com.aws.studentbuilder.finance.entity.Brinde;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.Parceria;
import com.aws.studentbuilder.finance.repository.BrindeRepository;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.ParceriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BrindeService {

    private final BrindeRepository brindeRepository;
    private final ParceriaRepository parceriaRepository;
    private final EventoRepository eventoRepository;

    public BrindeService(BrindeRepository brindeRepository, ParceriaRepository parceriaRepository, EventoRepository eventoRepository) {
        this.brindeRepository = brindeRepository;
        this.parceriaRepository = parceriaRepository;
        this.eventoRepository = eventoRepository;
    }

    @Transactional(readOnly = true)
    public List<BrindeDTO> listar(Long eventoId, Long parceriaId) {
        List<Brinde> brindes;
        if (eventoId != null) {
            brindes = brindeRepository.findByEventoDistribuicaoId(eventoId);
        } else if (parceriaId != null) {
            brindes = brindeRepository.findByOrigemParceriaId(parceriaId);
        } else {
            brindes = brindeRepository.findAll();
        }

        return brindes.stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public BrindeDTO buscarPorId(Long id) {
        Brinde brinde = brindeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brinde não encontrado com ID: " + id));
        return toDTO(brinde);
    }

    @Transactional
    public BrindeDTO criar(BrindeRequest request) {
        Parceria origem = null;
        if (request.getOrigemParceriaId() != null) {
            origem = parceriaRepository.findById(request.getOrigemParceriaId()).orElse(null);
        }

        Evento evento = null;
        if (request.getEventoDistribuicaoId() != null) {
            evento = eventoRepository.findById(request.getEventoDistribuicaoId()).orElse(null);
        }

        Brinde brinde = Brinde.builder()
                .item(request.getItem())
                .origemParceria(origem)
                .qtdRecebida(request.getQtdRecebida() != null ? request.getQtdRecebida() : 0)
                .qtdDistribuida(request.getQtdDistribuida() != null ? request.getQtdDistribuida() : 0)
                .eventoDistribuicao(evento)
                .dataDistribuicao(request.getDataDistribuicao())
                .observacoes(request.getObservacoes())
                .build();

        return toDTO(brindeRepository.save(brinde));
    }

    @Transactional
    public BrindeDTO atualizar(Long id, BrindeRequest request) {
        Brinde brinde = brindeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brinde não encontrado com ID: " + id));

        Parceria origem = null;
        if (request.getOrigemParceriaId() != null) {
            origem = parceriaRepository.findById(request.getOrigemParceriaId()).orElse(null);
        }

        Evento evento = null;
        if (request.getEventoDistribuicaoId() != null) {
            evento = eventoRepository.findById(request.getEventoDistribuicaoId()).orElse(null);
        }

        brinde.setItem(request.getItem());
        brinde.setOrigemParceria(origem);
        brinde.setQtdRecebida(request.getQtdRecebida() != null ? request.getQtdRecebida() : 0);
        brinde.setQtdDistribuida(request.getQtdDistribuida() != null ? request.getQtdDistribuida() : 0);
        brinde.setEventoDistribuicao(evento);
        brinde.setDataDistribuicao(request.getDataDistribuicao());
        brinde.setObservacoes(request.getObservacoes());

        return toDTO(brindeRepository.save(brinde));
    }

    @Transactional
    public void deletar(Long id) {
        if (!brindeRepository.existsById(id)) {
            throw new IllegalArgumentException("Brinde não encontrado com ID: " + id);
        }
        brindeRepository.deleteById(id);
    }

    public BrindeDTO toDTO(Brinde b) {
        return BrindeDTO.builder()
                .id(b.getId())
                .item(b.getItem())
                .origemParceriaId(b.getOrigemParceria() != null ? b.getOrigemParceria().getId() : null)
                .origemParceiroNome(b.getOrigemParceria() != null ? b.getOrigemParceria().getParceiro() : "Próprio / Interno")
                .qtdRecebida(b.getQtdRecebida())
                .qtdDistribuida(b.getQtdDistribuida())
                .saldoEstoque(b.getSaldoEstoque())
                .eventoDistribuicaoId(b.getEventoDistribuicao() != null ? b.getEventoDistribuicao().getId() : null)
                .eventoDistribuicaoNome(b.getEventoDistribuicao() != null ? b.getEventoDistribuicao().getNome() : "Não definido")
                .dataDistribuicao(b.getDataDistribuicao())
                .observacoes(b.getObservacoes())
                .criadoEm(b.getCriadoEm())
                .build();
    }
}
