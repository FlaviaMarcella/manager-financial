package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.ItemOrcamentoDTO;
import com.aws.studentbuilder.finance.dto.ItemOrcamentoRequest;
import com.aws.studentbuilder.finance.entity.Categoria;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.ItemOrcamento;
import com.aws.studentbuilder.finance.repository.CategoriaRepository;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.ItemOrcamentoRepository;
import com.aws.studentbuilder.finance.repository.LancamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrcamentoService {

    private final ItemOrcamentoRepository itemOrcamentoRepository;
    private final EventoRepository eventoRepository;
    private final CategoriaRepository categoriaRepository;
    private final LancamentoRepository lancamentoRepository;
    private final ConfigService configService;

    public OrcamentoService(ItemOrcamentoRepository itemOrcamentoRepository,
                            EventoRepository eventoRepository,
                            CategoriaRepository categoriaRepository,
                            LancamentoRepository lancamentoRepository,
                            ConfigService configService) {
        this.itemOrcamentoRepository = itemOrcamentoRepository;
        this.eventoRepository = eventoRepository;
        this.categoriaRepository = categoriaRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.configService = configService;
    }

    @Transactional(readOnly = true)
    public List<ItemOrcamentoDTO> listar(Long eventoId) {
        List<ItemOrcamento> itens = (eventoId != null)
                ? itemOrcamentoRepository.findByEventoId(eventoId)
                : itemOrcamentoRepository.findAll();

        return itens.stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItemOrcamentoDTO buscarPorId(Long id) {
        ItemOrcamento item = itemOrcamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item de orçamento não encontrado com ID: " + id));
        return toDTO(item);
    }

    @Transactional
    public ItemOrcamentoDTO criar(ItemOrcamentoRequest request) {
        Evento evento = eventoRepository.findById(request.getEventoId())
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + request.getEventoId()));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com ID: " + request.getCategoriaId()));

        itemOrcamentoRepository.findByEventoIdAndCategoriaId(request.getEventoId(), request.getCategoriaId())
                .ifPresent(i -> {
                    throw new IllegalArgumentException("Já existe um orçamento cadastrado para este evento e categoria.");
                });

        BigDecimal taxa = (request.getTaxaCambioUsada() != null && request.getTaxaCambioUsada().compareTo(BigDecimal.ZERO) > 0)
                ? request.getTaxaCambioUsada()
                : configService.getTaxaCambioAtual();

        ItemOrcamento item = ItemOrcamento.builder()
                .evento(evento)
                .categoria(categoria)
                .valorOrcadoUsd(request.getValorOrcadoUsd())
                .taxaCambioUsada(taxa)
                .observacoes(request.getObservacoes())
                .build();

        return toDTO(itemOrcamentoRepository.save(item));
    }

    @Transactional
    public ItemOrcamentoDTO atualizar(Long id, ItemOrcamentoRequest request) {
        ItemOrcamento item = itemOrcamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item de orçamento não encontrado com ID: " + id));

        Evento evento = eventoRepository.findById(request.getEventoId())
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + request.getEventoId()));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com ID: " + request.getCategoriaId()));

        itemOrcamentoRepository.findByEventoIdAndCategoriaId(request.getEventoId(), request.getCategoriaId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException("Já existe outro orçamento cadastrado para este evento e categoria.");
                    }
                });

        item.setEvento(evento);
        item.setCategoria(categoria);
        item.setValorOrcadoUsd(request.getValorOrcadoUsd());
        if (request.getTaxaCambioUsada() != null && request.getTaxaCambioUsada().compareTo(BigDecimal.ZERO) > 0) {
            item.setTaxaCambioUsada(request.getTaxaCambioUsada());
        }
        item.setObservacoes(request.getObservacoes());

        return toDTO(itemOrcamentoRepository.save(item));
    }

    @Transactional
    public void deletar(Long id) {
        if (!itemOrcamentoRepository.existsById(id)) {
            throw new IllegalArgumentException("Item de orçamento não encontrado com ID: " + id);
        }
        itemOrcamentoRepository.deleteById(id);
    }

    public ItemOrcamentoDTO toDTO(ItemOrcamento item) {
        BigDecimal taxa = item.getTaxaCambioUsada() != null ? item.getTaxaCambioUsada() : BigDecimal.ONE;
        BigDecimal valorOrcadoBrl = item.getValorOrcadoUsd().multiply(taxa).setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal valorRealizadoBrl = lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(
                item.getEvento().getId(), item.getCategoria().getId()
        );
        if (valorRealizadoBrl == null) {
            valorRealizadoBrl = BigDecimal.ZERO;
        }
        valorRealizadoBrl = valorRealizadoBrl.setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal saldoBrl = valorOrcadoBrl.subtract(valorRealizadoBrl).setScale(2, java.math.RoundingMode.HALF_UP);

        return ItemOrcamentoDTO.builder()
                .id(item.getId())
                .eventoId(item.getEvento().getId())
                .eventoNome(item.getEvento().getNome())
                .categoriaId(item.getCategoria().getId())
                .categoriaNome(item.getCategoria().getNome())
                .valorOrcadoUsd(item.getValorOrcadoUsd())
                .taxaCambioUsada(item.getTaxaCambioUsada())
                .valorOrcadoBrl(valorOrcadoBrl)
                .valorRealizadoBrl(valorRealizadoBrl)
                .saldoBrl(saldoBrl)
                .observacoes(item.getObservacoes())
                .criadoEm(item.getCriadoEm())
                .build();
    }
}
