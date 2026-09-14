package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.LancamentoDTO;
import com.aws.studentbuilder.finance.dto.LancamentoRequest;
import com.aws.studentbuilder.finance.entity.Categoria;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.Lancamento;
import com.aws.studentbuilder.finance.entity.StatusFinanceiro;
import com.aws.studentbuilder.finance.entity.Usuario;
import com.aws.studentbuilder.finance.repository.CategoriaRepository;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.LancamentoRepository;
import com.aws.studentbuilder.finance.repository.StatusFinanceiroRepository;
import com.aws.studentbuilder.finance.repository.UsuarioRepository;
import com.aws.studentbuilder.finance.security.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class LancamentoService {

    private final LancamentoRepository lancamentoRepository;
    private final EventoRepository eventoRepository;
    private final CategoriaRepository categoriaRepository;
    private final StatusFinanceiroRepository statusFinanceiroRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfigService configService;
    private final StorageService storageService;

    public LancamentoService(LancamentoRepository lancamentoRepository,
                             EventoRepository eventoRepository,
                             CategoriaRepository categoriaRepository,
                             StatusFinanceiroRepository statusFinanceiroRepository,
                             UsuarioRepository usuarioRepository,
                             ConfigService configService,
                             StorageService storageService) {
        this.lancamentoRepository = lancamentoRepository;
        this.eventoRepository = eventoRepository;
        this.categoriaRepository = categoriaRepository;
        this.statusFinanceiroRepository = statusFinanceiroRepository;
        this.usuarioRepository = usuarioRepository;
        this.configService = configService;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<LancamentoDTO> filtrar(
            Long eventoId,
            Long categoriaId,
            Long statusId,
            LocalDate dataInicio,
            LocalDate dataFim,
            String busca
    ) {
        Specification<Lancamento> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (eventoId != null) {
                predicates.add(cb.equal(root.get("evento").get("id"), eventoId));
            }
            if (categoriaId != null) {
                predicates.add(cb.equal(root.get("categoria").get("id"), categoriaId));
            }
            if (statusId != null) {
                predicates.add(cb.equal(root.get("status").get("id"), statusId));
            }
            if (dataInicio != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("data"), dataInicio));
            }
            if (dataFim != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("data"), dataFim));
            }
            if (busca != null && !busca.isBlank()) {
                String pattern = "%" + busca.trim().toLowerCase() + "%";
                Predicate desc = cb.like(cb.lower(root.get("descricao")), pattern);
                Predicate forn = cb.like(cb.lower(root.get("fornecedor")), pattern);
                Predicate nf = cb.like(cb.lower(root.get("numeroNotaFiscal")), pattern);
                predicates.add(cb.or(desc, forn, nf));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return lancamentoRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "data")).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public LancamentoDTO buscarPorId(Long id) {
        Lancamento lancamento = lancamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado com ID: " + id));
        return toDTO(lancamento);
    }

    @Transactional
    public LancamentoDTO criar(LancamentoRequest request) {
        Evento evento = eventoRepository.findById(request.getEventoId())
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + request.getEventoId()));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com ID: " + request.getCategoriaId()));

        StatusFinanceiro status = null;
        if (request.getStatusId() != null) {
            status = statusFinanceiroRepository.findById(request.getStatusId()).orElse(null);
        }

        Usuario responsavel = SecurityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .orElse(null);

        BigDecimal taxaCambio = configService.getTaxaCambioAtual();
        BigDecimal valorBrl = request.getValorBrl();
        BigDecimal valorUsd = request.getValorUsd();

        if (valorUsd == null || valorUsd.compareTo(BigDecimal.ZERO) == 0) {
            if (valorBrl != null && taxaCambio.compareTo(BigDecimal.ZERO) > 0) {
                valorUsd = valorBrl.divide(taxaCambio, 2, RoundingMode.HALF_UP);
            } else {
                valorUsd = BigDecimal.ZERO;
            }
        }

        Lancamento lancamento = Lancamento.builder()
                .data(request.getData())
                .descricao(request.getDescricao())
                .fornecedor(request.getFornecedor())
                .numeroNotaFiscal(request.getNumeroNotaFiscal())
                .evento(evento)
                .categoria(categoria)
                .valorBrl(valorBrl != null ? valorBrl : BigDecimal.ZERO)
                .valorUsd(valorUsd)
                .formaPagamento(request.getFormaPagamento())
                .status(status)
                .responsavel(responsavel)
                .observacoes(request.getObservacoes())
                .build();

        return toDTO(lancamentoRepository.save(lancamento));
    }

    @Transactional
    public LancamentoDTO atualizar(Long id, LancamentoRequest request) {
        Lancamento lancamento = lancamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado com ID: " + id));

        Evento evento = eventoRepository.findById(request.getEventoId())
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + request.getEventoId()));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com ID: " + request.getCategoriaId()));

        StatusFinanceiro status = null;
        if (request.getStatusId() != null) {
            status = statusFinanceiroRepository.findById(request.getStatusId()).orElse(null);
        }

        BigDecimal taxaCambio = configService.getTaxaCambioAtual();
        BigDecimal valorBrl = request.getValorBrl();
        BigDecimal valorUsd = request.getValorUsd();

        if (valorUsd == null || valorUsd.compareTo(BigDecimal.ZERO) == 0) {
            if (valorBrl != null && taxaCambio.compareTo(BigDecimal.ZERO) > 0) {
                valorUsd = valorBrl.divide(taxaCambio, 2, RoundingMode.HALF_UP);
            }
        }

        lancamento.setData(request.getData());
        lancamento.setDescricao(request.getDescricao());
        lancamento.setFornecedor(request.getFornecedor());
        lancamento.setNumeroNotaFiscal(request.getNumeroNotaFiscal());
        lancamento.setEvento(evento);
        lancamento.setCategoria(categoria);
        lancamento.setValorBrl(valorBrl != null ? valorBrl : BigDecimal.ZERO);
        lancamento.setValorUsd(valorUsd != null ? valorUsd : BigDecimal.ZERO);
        lancamento.setFormaPagamento(request.getFormaPagamento());
        lancamento.setStatus(status);
        lancamento.setObservacoes(request.getObservacoes());

        return toDTO(lancamentoRepository.save(lancamento));
    }

    @Transactional
    public LancamentoDTO vincularAnexo(Long id, MultipartFile file) {
        Lancamento lancamento = lancamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado com ID: " + id));

        if (lancamento.getAnexoUrl() != null) {
            storageService.delete(lancamento.getAnexoUrl());
        }

        String storedFilename = storageService.store(file);
        lancamento.setAnexoUrl(storedFilename);
        lancamento.setAnexoNomeOriginal(file.getOriginalFilename());

        return toDTO(lancamentoRepository.save(lancamento));
    }

    @Transactional
    public LancamentoDTO removerAnexo(Long id) {
        Lancamento lancamento = lancamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado com ID: " + id));

        if (lancamento.getAnexoUrl() != null) {
            storageService.delete(lancamento.getAnexoUrl());
            lancamento.setAnexoUrl(null);
            lancamento.setAnexoNomeOriginal(null);
            lancamento = lancamentoRepository.save(lancamento);
        }

        return toDTO(lancamento);
    }

    @Transactional(readOnly = true)
    public Resource carregarAnexo(Long id) {
        Lancamento lancamento = lancamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado com ID: " + id));

        if (lancamento.getAnexoUrl() == null) {
            throw new IllegalArgumentException("Lançamento não possui anexo.");
        }

        return storageService.loadAsResource(lancamento.getAnexoUrl());
    }

    @Transactional
    public void deletar(Long id) {
        Lancamento lancamento = lancamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado com ID: " + id));

        if (lancamento.getAnexoUrl() != null) {
            storageService.delete(lancamento.getAnexoUrl());
        }

        lancamentoRepository.delete(lancamento);
    }

    public LancamentoDTO toDTO(Lancamento l) {
        return LancamentoDTO.builder()
                .id(l.getId())
                .data(l.getData())
                .descricao(l.getDescricao())
                .fornecedor(l.getFornecedor())
                .numeroNotaFiscal(l.getNumeroNotaFiscal())
                .eventoId(l.getEvento().getId())
                .eventoNome(l.getEvento().getNome())
                .categoriaId(l.getCategoria().getId())
                .categoriaNome(l.getCategoria().getNome())
                .valorUsd(l.getValorUsd())
                .valorBrl(l.getValorBrl())
                .formaPagamento(l.getFormaPagamento())
                .statusId(l.getStatus() != null ? l.getStatus().getId() : null)
                .statusNome(l.getStatus() != null ? l.getStatus().getNome() : "Não definido")
                .statusCorBadge(l.getStatus() != null ? l.getStatus().getCorBadge() : "#888888")
                .responsavelId(l.getResponsavel() != null ? l.getResponsavel().getId() : null)
                .responsavelNome(l.getResponsavel() != null ? l.getResponsavel().getNome() : "Não atribuído")
                .anexoUrl(l.getAnexoUrl())
                .anexoNomeOriginal(l.getAnexoNomeOriginal())
                .observacoes(l.getObservacoes())
                .criadoEm(l.getCriadoEm())
                .build();
    }
}
