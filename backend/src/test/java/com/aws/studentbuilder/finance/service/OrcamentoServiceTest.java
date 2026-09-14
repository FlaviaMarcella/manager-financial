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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrcamentoServiceTest {

    @Mock
    private ItemOrcamentoRepository itemOrcamentoRepository;
    @Mock
    private EventoRepository eventoRepository;
    @Mock
    private CategoriaRepository categoriaRepository;
    @Mock
    private LancamentoRepository lancamentoRepository;
    @Mock
    private ConfigService configService;

    @InjectMocks
    private OrcamentoService orcamentoService;

    private Evento evento;
    private Categoria categoria;
    private ItemOrcamento itemOrcamento;

    @BeforeEach
    void setUp() {
        evento = Evento.builder().id(1L).nome("AWS Community Day").data(LocalDate.now()).build();
        categoria = Categoria.builder().id(1L).nome("Coffee Break").build();
        itemOrcamento = ItemOrcamento.builder()
                .id(1L)
                .evento(evento)
                .categoria(categoria)
                .valorOrcadoUsd(new BigDecimal("100.00"))
                .taxaCambioUsada(new BigDecimal("5.5000"))
                .build();
    }

    @Test
    @DisplayName("Deve criar item de orçamento com taxa vigente quando não informada")
    void deveCriarItemOrcamentoComTaxaPadrao() {
        ItemOrcamentoRequest request = ItemOrcamentoRequest.builder()
                .eventoId(1L)
                .categoriaId(1L)
                .valorOrcadoUsd(new BigDecimal("100.00"))
                .build();

        when(eventoRepository.findById(1L)).thenReturn(Optional.of(evento));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(itemOrcamentoRepository.findByEventoIdAndCategoriaId(1L, 1L)).thenReturn(Optional.empty());
        when(configService.getTaxaCambioAtual()).thenReturn(new BigDecimal("5.5000"));
        when(itemOrcamentoRepository.save(any(ItemOrcamento.class))).thenReturn(itemOrcamento);
        when(lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("200.00"));

        ItemOrcamentoDTO resultado = orcamentoService.criar(request);

        assertNotNull(resultado);
        assertEquals(new BigDecimal("100.00"), resultado.getValorOrcadoUsd());
        assertEquals(new BigDecimal("550.00"), resultado.getValorOrcadoBrl());
        assertEquals(new BigDecimal("200.00"), resultado.getValorRealizadoBrl());
        assertEquals(new BigDecimal("350.00"), resultado.getSaldoBrl());
    }

    @Test
    @DisplayName("Deve calcular saldo negativo se realizado exceder orçado")
    void deveCalcularSaldoNegativoQuandoExceder() {
        when(lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("600.00"));

        ItemOrcamentoDTO dto = orcamentoService.toDTO(itemOrcamento);

        assertNotNull(dto);
        assertEquals(new BigDecimal("550.00"), dto.getValorOrcadoBrl());
        assertEquals(new BigDecimal("600.00"), dto.getValorRealizadoBrl());
        assertEquals(new BigDecimal("-50.00"), dto.getSaldoBrl());
    }
}
