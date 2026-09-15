package com.aws.studentbuilder.finance.dto;

import com.aws.studentbuilder.finance.entity.StatusEvento;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RelatorioEventoDTO(
        Long eventoId,
        String eventoNome,
        LocalDate data,
        StatusEvento status,
        BigDecimal totalOrcadoUsd,
        BigDecimal totalOrcadoBrl,
        BigDecimal totalRealizadoUsd,
        BigDecimal totalRealizadoBrl,
        BigDecimal saldoRestanteBrl,
        BigDecimal saldoRestanteUsd,
        double percentualExecucao,
        int totalLancamentos,
        int totalComprovantesAnexados,
        List<ItemOrcamentoDTO> itensOrcamento,
        List<LancamentoDTO> lancamentos,
        List<ParceriaDTO> parcerias,
        List<BrindeDTO> brindesUtilizados
) {
}
