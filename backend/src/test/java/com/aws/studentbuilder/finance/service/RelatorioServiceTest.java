package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.ItemOrcamentoDTO;
import com.aws.studentbuilder.finance.dto.LancamentoDTO;
import com.aws.studentbuilder.finance.dto.RelatorioEventoDTO;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.StatusEvento;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.LancamentoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {

    @Mock
    private EventoRepository eventoRepository;
    @Mock
    private OrcamentoService orcamentoService;
    @Mock
    private LancamentoService lancamentoService;
    @Mock
    private LancamentoRepository lancamentoRepository;
    @Mock
    private ParceriaService parceriaService;
    @Mock
    private BrindeService brindeService;
    @Mock
    private StorageService storageService;
    @Mock
    private ConfigService configService;

    @InjectMocks
    private RelatorioService relatorioService;

    @Test
    @DisplayName("Deve gerar dados consolidados do relatório de evento com saldos e KPIs corretos")
    void deveGerarRelatorioConsolidado() {
        Evento evento = Evento.builder()
                .id(1L)
                .nome("AWS Community Day")
                .descricao("Encontro técnico da comunidade")
                .dataInicio(LocalDate.of(2026, 10, 15))
                .status(StatusEvento.PLANEJADO)
                .build();

        ItemOrcamentoDTO itemOrc = ItemOrcamentoDTO.builder()
                .id(1L)
                .eventoId(1L)
                .categoriaNome("Alimentação")
                .valorOrcadoUsd(new BigDecimal("200.00"))
                .valorOrcadoBrl(new BigDecimal("1000.00"))
                .taxaCambioUsada(new BigDecimal("5.0000"))
                .build();

        LancamentoDTO lancamento = LancamentoDTO.builder()
                .id(10L)
                .eventoId(1L)
                .descricao("Coffee Break")
                .valorBrl(new BigDecimal("400.00"))
                .valorUsd(new BigDecimal("80.00"))
                .anexoUrl("receipts/test.pdf")
                .build();

        when(eventoRepository.findById(1L)).thenReturn(Optional.of(evento));
        when(orcamentoService.listar(1L)).thenReturn(List.of(itemOrc));
        when(lancamentoService.filtrar(1L, null, null, null, null, null)).thenReturn(List.of(lancamento));
        when(parceriaService.listar(1L)).thenReturn(Collections.emptyList());
        when(brindeService.listar(1L, null)).thenReturn(Collections.emptyList());

        RelatorioEventoDTO relatorio = relatorioService.obterRelatorioEvento(1L);

        assertNotNull(relatorio);
        assertEquals("AWS Community Day", relatorio.eventoNome());
        assertEquals(new BigDecimal("1000.00"), relatorio.totalOrcadoBrl());
        assertEquals(new BigDecimal("400.00"), relatorio.totalRealizadoBrl());
        assertEquals(new BigDecimal("600.00"), relatorio.saldoRestanteBrl());
        assertEquals(40.0, relatorio.percentualExecucao(), 0.01);
        assertEquals(1, relatorio.totalLancamentos());
        assertEquals(1, relatorio.totalComprovantesAnexados());
    }
}
