package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.ItemOrcamentoDTO;
import com.aws.studentbuilder.finance.dto.ItemOrcamentoRequest;
import com.aws.studentbuilder.finance.dto.TransferenciaOrcamentoDTO;
import com.aws.studentbuilder.finance.dto.TransferenciaOrcamentoRequest;
import com.aws.studentbuilder.finance.entity.Categoria;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.ItemOrcamento;
import com.aws.studentbuilder.finance.entity.TransferenciaOrcamento;
import com.aws.studentbuilder.finance.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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
    private TransferenciaOrcamentoRepository transferenciaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ConfigService configService;

    @InjectMocks
    private OrcamentoService orcamentoService;

    private Evento evento;
    private Evento eventoDestino;
    private Categoria categoria;
    private ItemOrcamento itemOrcamento;

    @BeforeEach
    void setUp() {
        evento = Evento.builder().id(1L).nome("AWS Community Day").data(LocalDate.now()).build();
        eventoDestino = Evento.builder().id(2L).nome("Hackathon Serverless").data(LocalDate.now().plusMonths(1)).build();
        categoria = Categoria.builder().id(1L).nome("Coffee Break").build();
        itemOrcamento = ItemOrcamento.builder()
                .id(1L)
                .evento(evento)
                .categoria(categoria)
                .descricao("Aporte Inicial")
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
                .descricao("Aporte Inicial")
                .valorOrcadoUsd(new BigDecimal("100.00"))
                .build();

        when(eventoRepository.findById(1L)).thenReturn(Optional.of(evento));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(configService.getTaxaCambioAtual()).thenReturn(new BigDecimal("5.5000"));
        when(itemOrcamentoRepository.save(any(ItemOrcamento.class))).thenReturn(itemOrcamento);
        when(itemOrcamentoRepository.sumOrcadoUsdByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("100.00"));
        when(lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("200.00"));
        when(lancamentoRepository.sumGastoUsdByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("36.36"));

        ItemOrcamentoDTO resultado = orcamentoService.criar(request);

        assertNotNull(resultado);
        assertEquals("Aporte Inicial", resultado.getDescricao());
        assertEquals(new BigDecimal("100.00"), resultado.getValorOrcadoUsd());
        assertEquals(new BigDecimal("550.00"), resultado.getValorOrcadoBrl());
        assertEquals(new BigDecimal("200.00"), resultado.getValorRealizadoBrl());
        assertEquals(new BigDecimal("63.64"), resultado.getSaldoUsd());
        assertEquals(new BigDecimal("350.02"), resultado.getSaldoBrl());
    }

    @Test
    @DisplayName("Deve permitir cadastrar múltiplos aportes para o mesmo evento e categoria")
    void devePermitirMultiplosAportesParaMesmoEventoECategoria() {
        ItemOrcamento item2 = ItemOrcamento.builder()
                .id(2L)
                .evento(evento)
                .categoria(categoria)
                .descricao("Patrocínio Adicional AWS")
                .valorOrcadoUsd(new BigDecimal("50.00"))
                .taxaCambioUsada(new BigDecimal("5.5000"))
                .build();

        ItemOrcamentoRequest request2 = ItemOrcamentoRequest.builder()
                .eventoId(1L)
                .categoriaId(1L)
                .descricao("Patrocínio Adicional AWS")
                .valorOrcadoUsd(new BigDecimal("50.00"))
                .build();

        when(eventoRepository.findById(1L)).thenReturn(Optional.of(evento));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(configService.getTaxaCambioAtual()).thenReturn(new BigDecimal("5.5000"));
        when(itemOrcamentoRepository.save(any(ItemOrcamento.class))).thenReturn(item2);
        when(itemOrcamentoRepository.sumOrcadoUsdByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("150.00"));
        when(lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("0.00"));
        when(lancamentoRepository.sumGastoUsdByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("0.00"));

        ItemOrcamentoDTO resultado = orcamentoService.criar(request2);

        assertNotNull(resultado);
        assertEquals("Patrocínio Adicional AWS", resultado.getDescricao());
        assertEquals(new BigDecimal("50.00"), resultado.getValorOrcadoUsd());
    }

    @Test
    @DisplayName("Deve calcular saldo zerado quando todo o orçamento em USD for utilizado")
    void deveCalcularSaldoZeradoQuandoUsdEsgotado() {
        // Exemplo Demo Day: Orçado 168.11 USD, Gastos totalizaram 168.11 USD e 771.96 BRL
        ItemOrcamento demoDayItem = ItemOrcamento.builder()
                .id(2L)
                .evento(evento)
                .categoria(categoria)
                .valorOrcadoUsd(new BigDecimal("168.11"))
                .taxaCambioUsada(new BigDecimal("5.1355"))
                .build();

        when(itemOrcamentoRepository.sumOrcadoUsdByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("168.11"));
        when(lancamentoRepository.sumGastoUsdByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("168.11"));
        when(lancamentoRepository.sumGastoBrlByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("771.96"));

        ItemOrcamentoDTO dto = orcamentoService.toDTO(demoDayItem);

        assertNotNull(dto);
        assertEquals(new BigDecimal("168.11"), dto.getValorRealizadoUsd());
        assertEquals(new BigDecimal("0.00"), dto.getSaldoUsd());
        assertEquals(new BigDecimal("0.00"), dto.getSaldoBrl());
        assertEquals(new BigDecimal("771.96"), dto.getValorRealizadoBrl());
        // Taxa retida = 863.33 - 771.96 = 91.37
        assertEquals(new BigDecimal("91.37"), dto.getTaxaRetidaTotal());
    }

    @Test
    @DisplayName("Deve realizar transferência de saldo com sucesso entre eventos")
    void deveTransferirSaldoComSucesso() {
        TransferenciaOrcamentoRequest req = TransferenciaOrcamentoRequest.builder()
                .eventoOrigemId(1L)
                .categoriaOrigemId(1L)
                .eventoDestinoId(2L)
                .categoriaDestinoId(1L)
                .valorUsd(new BigDecimal("40.00"))
                .motivo("Sobra de alimentação")
                .build();

        when(eventoRepository.findById(1L)).thenReturn(Optional.of(evento));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(eventoRepository.findById(2L)).thenReturn(Optional.of(eventoDestino));
        when(itemOrcamentoRepository.findByEventoIdAndCategoriaId(1L, 1L)).thenReturn(List.of(itemOrcamento));
        when(lancamentoRepository.sumGastoUsdByEventoIdAndCategoriaId(1L, 1L)).thenReturn(new BigDecimal("30.00"));
        when(configService.getTaxaCambioAtual()).thenReturn(new BigDecimal("5.5000"));

        TransferenciaOrcamento transfSalva = TransferenciaOrcamento.builder()
                .id(10L)
                .eventoOrigem(evento)
                .categoriaOrigem(categoria)
                .eventoDestino(eventoDestino)
                .categoriaDestino(categoria)
                .valorUsd(new BigDecimal("40.00"))
                .taxaCambio(new BigDecimal("5.5000"))
                .valorBrl(new BigDecimal("220.00"))
                .motivo("Sobra de alimentação")
                .build();

        when(transferenciaRepository.save(any(TransferenciaOrcamento.class))).thenReturn(transfSalva);

        TransferenciaOrcamentoDTO resultado = orcamentoService.transferirSaldo(req);

        assertNotNull(resultado);
        assertEquals(10L, resultado.getId());
        assertEquals(new BigDecimal("40.00"), resultado.getValorUsd());
        assertEquals(new BigDecimal("220.00"), resultado.getValorBrl());
        assertEquals("Sobra de alimentação", resultado.getMotivo());
    }
}
