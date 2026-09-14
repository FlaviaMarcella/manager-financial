package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.ChartDataDTO;
import com.aws.studentbuilder.finance.dto.DashboardSummaryDTO;
import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.StatusParceria;
import com.aws.studentbuilder.finance.repository.EventoRepository;
import com.aws.studentbuilder.finance.repository.ItemOrcamentoRepository;
import com.aws.studentbuilder.finance.repository.LancamentoRepository;
import com.aws.studentbuilder.finance.repository.ParceriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class DashboardService {

    private final ItemOrcamentoRepository itemOrcamentoRepository;
    private final LancamentoRepository lancamentoRepository;
    private final ParceriaRepository parceriaRepository;
    private final EventoRepository eventoRepository;
    private final ConfigService configService;

    // Paleta de cores oficial AWS Student Builder
    private static final String[] PALETTE_COLORS = {
            "#FF9900", // Amber
            "#AC5BFF", // Purple
            "#41B3FF", // Blue
            "#00E582", // Mint
            "#FF57E9", // Magenta
            "#151D25"  // Navy
    };

    public DashboardService(ItemOrcamentoRepository itemOrcamentoRepository,
                            LancamentoRepository lancamentoRepository,
                            ParceriaRepository parceriaRepository,
                            EventoRepository eventoRepository,
                            ConfigService configService) {
        this.itemOrcamentoRepository = itemOrcamentoRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.parceriaRepository = parceriaRepository;
        this.eventoRepository = eventoRepository;
        this.configService = configService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary() {
        BigDecimal totalOrcadoBrl = itemOrcamentoRepository.sumTotalOrcadoBrl();
        if (totalOrcadoBrl == null) totalOrcadoBrl = BigDecimal.ZERO;

        BigDecimal totalOrcadoUsd = itemOrcamentoRepository.sumTotalOrcadoUsd();
        if (totalOrcadoUsd == null) totalOrcadoUsd = BigDecimal.ZERO;

        BigDecimal totalGastoBrl = lancamentoRepository.sumTotalGastoBrl();
        if (totalGastoBrl == null) totalGastoBrl = BigDecimal.ZERO;

        BigDecimal saldoDisponivelBrl = totalOrcadoBrl.subtract(totalGastoBrl);

        BigDecimal totalRecebidoParceriasBrl = parceriaRepository.sumTotalRecebidoParcerias();
        if (totalRecebidoParceriasBrl == null) totalRecebidoParceriasBrl = BigDecimal.ZERO;

        BigDecimal taxaCambioAtual = configService.getTaxaCambioAtual();

        // Gráfico de Gastos por Categoria
        List<Object[]> categoriaRows = lancamentoRepository.sumGastoBrlGroupedByCategoria();
        List<ChartDataDTO> gastosPorCategoria = new ArrayList<>();
        int colorIdx = 0;
        for (Object[] row : categoriaRows) {
            String categoriaNome = (String) row[0];
            BigDecimal total = (BigDecimal) row[1];
            String color = PALETTE_COLORS[colorIdx % PALETTE_COLORS.length];
            colorIdx++;
            gastosPorCategoria.add(ChartDataDTO.builder()
                    .label(categoriaNome)
                    .value(total != null ? total : BigDecimal.ZERO)
                    .color(color)
                    .build());
        }

        // Gráfico de Orçado vs Realizado por Evento
        List<Evento> eventos = eventoRepository.findAll();
        List<ChartDataDTO> orcadoVsRealizadoPorEvento = new ArrayList<>();
        for (Evento e : eventos) {
            BigDecimal orcado = itemOrcamentoRepository.sumOrcadoBrlByEventoId(e.getId());
            if (orcado == null) orcado = BigDecimal.ZERO;

            BigDecimal realizado = lancamentoRepository.sumGastoBrlByEventoId(e.getId());
            if (realizado == null) realizado = BigDecimal.ZERO;

            if (orcado.compareTo(BigDecimal.ZERO) > 0 || realizado.compareTo(BigDecimal.ZERO) > 0) {
                orcadoVsRealizadoPorEvento.add(ChartDataDTO.builder()
                        .label(e.getNome())
                        .value(orcado)
                        .secondaryValue(realizado)
                        .build());
            }
        }

        // Contagem de Parcerias por Status
        Map<String, Long> contagemParceriasPorStatus = new LinkedHashMap<>();
        for (StatusParceria sp : StatusParceria.values()) {
            contagemParceriasPorStatus.put(sp.name(), 0L);
        }
        List<Object[]> statusRows = parceriaRepository.countGroupedByStatus();
        for (Object[] row : statusRows) {
            StatusParceria status = (StatusParceria) row[0];
            Long count = (Long) row[1];
            if (status != null) {
                contagemParceriasPorStatus.put(status.name(), count);
            }
        }

        return DashboardSummaryDTO.builder()
                .totalOrcadoUsd(totalOrcadoUsd)
                .totalOrcadoBrl(totalOrcadoBrl)
                .totalGastoBrl(totalGastoBrl)
                .saldoDisponivelBrl(saldoDisponivelBrl)
                .totalRecebidoParceriasBrl(totalRecebidoParceriasBrl)
                .taxaCambioAtual(taxaCambioAtual)
                .gastosPorCategoria(gastosPorCategoria)
                .orcadoVsRealizadoPorEvento(orcadoVsRealizadoPorEvento)
                .contagemParceriasPorStatus(contagemParceriasPorStatus)
                .build();
    }
}
