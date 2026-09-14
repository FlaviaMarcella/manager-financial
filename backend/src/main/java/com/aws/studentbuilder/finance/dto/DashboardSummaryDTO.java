package com.aws.studentbuilder.finance.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDTO {
    private BigDecimal totalOrcadoUsd;
    private BigDecimal totalOrcadoBrl;
    private BigDecimal totalGastoBrl;
    private BigDecimal saldoDisponivelBrl;
    private BigDecimal totalRecebidoParceriasBrl;
    private BigDecimal taxaCambioAtual;

    private List<ChartDataDTO> gastosPorCategoria;
    private List<ChartDataDTO> orcadoVsRealizadoPorEvento;
    private Map<String, Long> contagemParceriasPorStatus;

    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(BigDecimal totalOrcadoUsd, BigDecimal totalOrcadoBrl, BigDecimal totalGastoBrl,
                               BigDecimal saldoDisponivelBrl, BigDecimal totalRecebidoParceriasBrl,
                               BigDecimal taxaCambioAtual, List<ChartDataDTO> gastosPorCategoria,
                               List<ChartDataDTO> orcadoVsRealizadoPorEvento, Map<String, Long> contagemParceriasPorStatus) {
        this.totalOrcadoUsd = totalOrcadoUsd;
        this.totalOrcadoBrl = totalOrcadoBrl;
        this.totalGastoBrl = totalGastoBrl;
        this.saldoDisponivelBrl = saldoDisponivelBrl;
        this.totalRecebidoParceriasBrl = totalRecebidoParceriasBrl;
        this.taxaCambioAtual = taxaCambioAtual;
        this.gastosPorCategoria = gastosPorCategoria;
        this.orcadoVsRealizadoPorEvento = orcadoVsRealizadoPorEvento;
        this.contagemParceriasPorStatus = contagemParceriasPorStatus;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private BigDecimal totalOrcadoUsd;
        private BigDecimal totalOrcadoBrl;
        private BigDecimal totalGastoBrl;
        private BigDecimal saldoDisponivelBrl;
        private BigDecimal totalRecebidoParceriasBrl;
        private BigDecimal taxaCambioAtual;
        private List<ChartDataDTO> gastosPorCategoria;
        private List<ChartDataDTO> orcadoVsRealizadoPorEvento;
        private Map<String, Long> contagemParceriasPorStatus;

        public Builder totalOrcadoUsd(BigDecimal totalOrcadoUsd) { this.totalOrcadoUsd = totalOrcadoUsd; return this; }
        public Builder totalOrcadoBrl(BigDecimal totalOrcadoBrl) { this.totalOrcadoBrl = totalOrcadoBrl; return this; }
        public Builder totalGastoBrl(BigDecimal totalGastoBrl) { this.totalGastoBrl = totalGastoBrl; return this; }
        public Builder saldoDisponivelBrl(BigDecimal saldoDisponivelBrl) { this.saldoDisponivelBrl = saldoDisponivelBrl; return this; }
        public Builder totalRecebidoParceriasBrl(BigDecimal totalRecebidoParceriasBrl) { this.totalRecebidoParceriasBrl = totalRecebidoParceriasBrl; return this; }
        public Builder taxaCambioAtual(BigDecimal taxaCambioAtual) { this.taxaCambioAtual = taxaCambioAtual; return this; }
        public Builder gastosPorCategoria(List<ChartDataDTO> gastosPorCategoria) { this.gastosPorCategoria = gastosPorCategoria; return this; }
        public Builder orcadoVsRealizadoPorEvento(List<ChartDataDTO> orcadoVsRealizadoPorEvento) { this.orcadoVsRealizadoPorEvento = orcadoVsRealizadoPorEvento; return this; }
        public Builder contagemParceriasPorStatus(Map<String, Long> contagemParceriasPorStatus) { this.contagemParceriasPorStatus = contagemParceriasPorStatus; return this; }
        public DashboardSummaryDTO build() {
            return new DashboardSummaryDTO(totalOrcadoUsd, totalOrcadoBrl, totalGastoBrl, saldoDisponivelBrl, totalRecebidoParceriasBrl, taxaCambioAtual, gastosPorCategoria, orcadoVsRealizadoPorEvento, contagemParceriasPorStatus);
        }
    }

    public BigDecimal getTotalOrcadoUsd() { return totalOrcadoUsd; }
    public void setTotalOrcadoUsd(BigDecimal totalOrcadoUsd) { this.totalOrcadoUsd = totalOrcadoUsd; }
    public BigDecimal getTotalOrcadoBrl() { return totalOrcadoBrl; }
    public void setTotalOrcadoBrl(BigDecimal totalOrcadoBrl) { this.totalOrcadoBrl = totalOrcadoBrl; }
    public BigDecimal getTotalGastoBrl() { return totalGastoBrl; }
    public void setTotalGastoBrl(BigDecimal totalGastoBrl) { this.totalGastoBrl = totalGastoBrl; }
    public BigDecimal getSaldoDisponivelBrl() { return saldoDisponivelBrl; }
    public void setSaldoDisponivelBrl(BigDecimal saldoDisponivelBrl) { this.saldoDisponivelBrl = saldoDisponivelBrl; }
    public BigDecimal getTotalRecebidoParceriasBrl() { return totalRecebidoParceriasBrl; }
    public void setTotalRecebidoParceriasBrl(BigDecimal totalRecebidoParceriasBrl) { this.totalRecebidoParceriasBrl = totalRecebidoParceriasBrl; }
    public BigDecimal getTaxaCambioAtual() { return taxaCambioAtual; }
    public void setTaxaCambioAtual(BigDecimal taxaCambioAtual) { this.taxaCambioAtual = taxaCambioAtual; }
    public List<ChartDataDTO> getGastosPorCategoria() { return gastosPorCategoria; }
    public void setGastosPorCategoria(List<ChartDataDTO> gastosPorCategoria) { this.gastosPorCategoria = gastosPorCategoria; }
    public List<ChartDataDTO> getOrcadoVsRealizadoPorEvento() { return orcadoVsRealizadoPorEvento; }
    public void setOrcadoVsRealizadoPorEvento(List<ChartDataDTO> orcadoVsRealizadoPorEvento) { this.orcadoVsRealizadoPorEvento = orcadoVsRealizadoPorEvento; }
    public Map<String, Long> getContagemParceriasPorStatus() { return contagemParceriasPorStatus; }
    public void setContagemParceriasPorStatus(Map<String, Long> contagemParceriasPorStatus) { this.contagemParceriasPorStatus = contagemParceriasPorStatus; }
}
