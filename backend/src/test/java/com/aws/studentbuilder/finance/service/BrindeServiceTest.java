package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.BrindeDTO;
import com.aws.studentbuilder.finance.dto.BrindeRequest;
import com.aws.studentbuilder.finance.entity.Brinde;
import com.aws.studentbuilder.finance.repository.BrindeRepository;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.ParceriaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BrindeServiceTest {

    @Mock
    private BrindeRepository brindeRepository;
    @Mock
    private ParceriaRepository parceriaRepository;
    @Mock
    private EventoRepository eventoRepository;

    @InjectMocks
    private BrindeService brindeService;

    @Test
    @DisplayName("Deve calcular corretamente o saldo de estoque do brinde (recebido - distribuído)")
    void deveCalcularSaldoEstoque() {
        Brinde brinde = Brinde.builder()
                .id(1L)
                .item("Camisetas")
                .qtdRecebida(100)
                .qtdDistribuida(30)
                .build();

        BrindeDTO dto = brindeService.toDTO(brinde);

        assertEquals(70, dto.getSaldoEstoque());
    }

    @Test
    @DisplayName("Deve cadastrar brinde com sucesso")
    void deveCadastrarBrinde() {
        BrindeRequest request = BrindeRequest.builder()
                .item("Canecas AWS")
                .qtdRecebida(50)
                .qtdDistribuida(0)
                .build();

        Brinde brinde = Brinde.builder()
                .id(2L)
                .item("Canecas AWS")
                .qtdRecebida(50)
                .qtdDistribuida(0)
                .build();

        when(brindeRepository.save(any(Brinde.class))).thenReturn(brinde);

        BrindeDTO resultado = brindeService.criar(request);

        assertNotNull(resultado);
        assertEquals("Canecas AWS", resultado.getItem());
        assertEquals(50, resultado.getSaldoEstoque());
    }
}
