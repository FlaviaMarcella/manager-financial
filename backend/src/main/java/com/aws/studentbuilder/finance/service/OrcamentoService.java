package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.CategoriaSaldoDisponivelDTO;
import com.aws.studentbuilder.finance.dto.ItemOrcamentoDTO;
import com.aws.studentbuilder.finance.dto.ItemOrcamentoRequest;
import com.aws.studentbuilder.finance.dto.TransferenciaOrcamentoDTO;
import com.aws.studentbuilder.finance.dto.TransferenciaOrcamentoRequest;
import com.aws.studentbuilder.finance.entity.Categoria;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.ItemOrcamento;
import com.aws.studentbuilder.finance.entity.TransferenciaOrcamento;
import com.aws.studentbuilder.finance.entity.Usuario;
import com.aws.studentbuilder.finance.repository.CategoriaRepository;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.ItemOrcamentoRepository;
import com.aws.studentbuilder.finance.repository.LancamentoRepository;
import com.aws.studentbuilder.finance.repository.TransferenciaOrcamentoRepository;
import com.aws.studentbuilder.finance.repository.UsuarioRepository;
import com.aws.studentbuilder.finance.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrcamentoService {

    private final ItemOrcamentoRepository itemOrcamentoRepository;
    private final EventoRepository eventoRepository;
    private final CategoriaRepository categoriaRepository;
    private final LancamentoRepository lancamentoRepository;
    private final TransferenciaOrcamentoRepository transferenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfigService configService;

    public OrcamentoService(ItemOrcamentoRepository itemOrcamentoRepository,
                            EventoRepository eventoRepository,
                            CategoriaRepository categoriaRepository,
                            LancamentoRepository lancamentoRepository,
                            TransferenciaOrcamentoRepository transferenciaRepository,
                            UsuarioRepository usuarioRepository,
                            ConfigService configService) {
        this.itemOrcamentoRepository = itemOrcamentoRepository;
        this.eventoRepository = eventoRepository;
        this.categoriaRepository = categoriaRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.transferenciaRepository = transferenciaRepository;
        this.usuarioRepository = usuarioRepository;
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

    @Transactional
    public TransferenciaOrcamentoDTO transferirSaldo(TransferenciaOrcamentoRequest request) {
        if (request.getEventoOrigemId().equals(request.getEventoDestinoId()) &&
            request.getCategoriaOrigemId().equals(request.getCategoriaDestinoId())) {
            throw new IllegalArgumentException("O evento e categoria de origem não podem ser idênticos ao destino.");
        }

        Evento eventoOrigem = eventoRepository.findById(request.getEventoOrigemId())
                .orElseThrow(() -> new IllegalArgumentException("Evento de origem não encontrado com ID: " + request.getEventoOrigemId()));

        Categoria categoriaOrigem = categoriaRepository.findById(request.getCategoriaOrigemId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria de origem não encontrada com ID: " + request.getCategoriaOrigemId()));

        Evento eventoDestino = eventoRepository.findById(request.getEventoDestinoId())
                .orElseThrow(() -> new IllegalArgumentException("Evento de destino não encontrado com ID: " + request.getEventoDestinoId()));

        Categoria categoriaDestino = categoriaRepository.findById(request.getCategoriaDestinoId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria de destino não encontrada com ID: " + request.getCategoriaDestinoId()));

        ItemOrcamento itemOrigem = itemOrcamentoRepository.findByEventoIdAndCategoriaId(
                request.getEventoOrigemId(), request.getCategoriaOrigemId()
        ).orElseThrow(() -> new IllegalArgumentException("Não há orçamento cadastrado para a categoria de origem no evento selecionado."));

        // Cálculo do saldo disponível em USD na origem
        BigDecimal taxaOrigem = itemOrigem.getTaxaCambioUsada() != null ? itemOrigem.getTaxaCambioUsada() : configService.getTaxaCambioAtual();
        BigDecimal gastoUsd = lancamentoRepository.sumGastoUsdByEventoIdAndCategoriaId(request.getEventoOrigemId(), request.getCategoriaOrigemId());
        if (gastoUsd == null) {
            BigDecimal gastoBrl = lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(request.getEventoOrigemId(), request.getCategoriaOrigemId());
            gastoUsd = (gastoBrl != null && taxaOrigem.compareTo(BigDecimal.ZERO) > 0)
                    ? gastoBrl.divide(taxaOrigem, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
        }

        BigDecimal saldoDisponivelUsd = itemOrigem.getValorOrcadoUsd().subtract(gastoUsd).setScale(2, RoundingMode.HALF_UP);

        if (request.getValorUsd().compareTo(saldoDisponivelUsd) > 0) {
            throw new IllegalArgumentException(String.format(
                    "Saldo insuficiente para transferência. Saldo disponível: US$ %.2f (Solicitado: US$ %.2f)",
                    saldoDisponivelUsd, request.getValorUsd()
            ));
        }

        // 1. Deduz do item de origem
        itemOrigem.setValorOrcadoUsd(itemOrigem.getValorOrcadoUsd().subtract(request.getValorUsd()));
        itemOrcamentoRepository.save(itemOrigem);

        // 2. Incrementa ou cria item no evento de destino
        BigDecimal taxaAtual = (request.getTaxaCambio() != null && request.getTaxaCambio().compareTo(BigDecimal.ZERO) > 0)
                ? request.getTaxaCambio()
                : configService.getTaxaCambioAtual();

        ItemOrcamento itemDestino = itemOrcamentoRepository.findByEventoIdAndCategoriaId(
                request.getEventoDestinoId(), request.getCategoriaDestinoId()
        ).orElseGet(() -> ItemOrcamento.builder()
                .evento(eventoDestino)
                .categoria(categoriaDestino)
                .valorOrcadoUsd(BigDecimal.ZERO)
                .taxaCambioUsada(taxaAtual)
                .observacoes("Criado a partir de transferência de sobra orçamentária")
                .build()
        );

        itemDestino.setValorOrcadoUsd(itemDestino.getValorOrcadoUsd().add(request.getValorUsd()));
        itemDestino.setTaxaCambioUsada(taxatual(itemDestino, taxaAtual));
        itemOrcamentoRepository.save(itemDestino);

        // 3. Registra auditoria da transferência
        BigDecimal valorBrl = request.getValorUsd().multiply(taxaAtual).setScale(2, RoundingMode.HALF_UP);
        Usuario usuario = SecurityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .orElse(null);

        TransferenciaOrcamento transf = TransferenciaOrcamento.builder()
                .eventoOrigem(eventoOrigem)
                .categoriaOrigem(categoriaOrigem)
                .eventoDestino(eventoDestino)
                .categoriaDestino(categoriaDestino)
                .valorUsd(request.getValorUsd())
                .taxaCambio(taxaAtual)
                .valorBrl(valorBrl)
                .motivo(request.getMotivo())
                .usuario(usuario)
                .build();

        TransferenciaOrcamento salvo = transferenciaRepository.save(transf);
        return toTransferenciaDTO(salvo);
    }

    private BigDecimal taxatual(ItemOrcamento item, BigDecimal taxaAtual) {
        return (item.getTaxaCambioUsada() != null && item.getTaxaCambioUsada().compareTo(BigDecimal.ZERO) > 0)
                ? item.getTaxaCambioUsada()
                : taxaAtual;
    }

    @Transactional(readOnly = true)
    public List<TransferenciaOrcamentoDTO> listarTransferencias(Long eventoId) {
        return transferenciaRepository.findByEventoId(eventoId).stream()
                .map(this::toTransferenciaDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoriaSaldoDisponivelDTO> obterSaldosDisponiveis(Long eventoId) {
        List<ItemOrcamento> itens = itemOrcamentoRepository.findByEventoId(eventoId);
        List<CategoriaSaldoDisponivelDTO> saldos = new ArrayList<>();

        for (ItemOrcamento item : itens) {
            BigDecimal taxa = item.getTaxaCambioUsada() != null ? item.getTaxaCambioUsada() : configService.getTaxaCambioAtual();
            BigDecimal gastoUsd = lancamentoRepository.sumGastoUsdByEventoIdAndCategoriaId(eventoId, item.getCategoria().getId());
            if (gastoUsd == null) {
                BigDecimal gastoBrl = lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(eventoId, item.getCategoria().getId());
                gastoUsd = (gastoBrl != null && taxa.compareTo(BigDecimal.ZERO) > 0)
                        ? gastoBrl.divide(taxa, 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
            }

            BigDecimal saldoUsd = item.getValorOrcadoUsd().subtract(gastoUsd).setScale(2, RoundingMode.HALF_UP);
            BigDecimal saldoBrl = saldoUsd.multiply(taxa).setScale(2, RoundingMode.HALF_UP);

            saldos.add(CategoriaSaldoDisponivelDTO.builder()
                    .categoriaId(item.getCategoria().getId())
                    .categoriaNome(item.getCategoria().getNome())
                    .valorOrcadoUsd(item.getValorOrcadoUsd())
                    .valorGastoUsd(gastoUsd)
                    .saldoDisponivelUsd(saldoUsd)
                    .saldoDisponivelBrl(saldoBrl)
                    .build());
        }

        return saldos;
    }

    public TransferenciaOrcamentoDTO toTransferenciaDTO(TransferenciaOrcamento t) {
        return TransferenciaOrcamentoDTO.builder()
                .id(t.getId())
                .eventoOrigemId(t.getEventoOrigem().getId())
                .eventoOrigemNome(t.getEventoOrigem().getNome())
                .categoriaOrigemId(t.getCategoriaOrigem().getId())
                .categoriaOrigemNome(t.getCategoriaOrigem().getNome())
                .eventoDestinoId(t.getEventoDestino().getId())
                .eventoDestinoNome(t.getEventoDestino().getNome())
                .categoriaDestinoId(t.getCategoriaDestino().getId())
                .categoriaDestinoNome(t.getCategoriaDestino().getNome())
                .valorUsd(t.getValorUsd())
                .taxaCambio(t.getTaxaCambio())
                .valorBrl(t.getValorBrl())
                .motivo(t.getMotivo())
                .usuarioNome(t.getUsuario() != null ? t.getUsuario().getNome() : "Administrador")
                .usuarioEmail(t.getUsuario() != null ? t.getUsuario().getEmail() : "")
                .criadoEm(t.getCriadoEm())
                .build();
    }

    public ItemOrcamentoDTO toDTO(ItemOrcamento item) {
        BigDecimal taxa = item.getTaxaCambioUsada() != null ? item.getTaxaCambioUsada() : BigDecimal.ONE;
        BigDecimal valorOrcadoBrl = item.getValorOrcadoUsd().multiply(taxa).setScale(2, RoundingMode.HALF_UP);

        BigDecimal valorRealizadoBrl = lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(
                item.getEvento().getId(), item.getCategoria().getId()
        );
        if (valorRealizadoBrl == null) {
            valorRealizadoBrl = BigDecimal.ZERO;
        }
        valorRealizadoBrl = valorRealizadoBrl.setScale(2, RoundingMode.HALF_UP);

        BigDecimal saldoBrl = valorOrcadoBrl.subtract(valorRealizadoBrl).setScale(2, RoundingMode.HALF_UP);

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
