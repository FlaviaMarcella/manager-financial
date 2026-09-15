package com.aws.studentbuilder.finance.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class TransferenciaOrcamentoDTO {
    private Long id;
    private Long eventoOrigemId;
    private String eventoOrigemNome;
    private Long categoriaOrigemId;
    private String categoriaOrigemNome;
    private Long eventoDestinoId;
    private String eventoDestinoNome;
    private Long categoriaDestinoId;
    private String categoriaDestinoNome;
    private BigDecimal valorUsd;
    private BigDecimal taxaCambio;
    private BigDecimal valorBrl;
    private String motivo;
    private String usuarioNome;
    private String usuarioEmail;
    private OffsetDateTime criadoEm;

    public TransferenciaOrcamentoDTO() {}

    public TransferenciaOrcamentoDTO(Long id, Long eventoOrigemId, String eventoOrigemNome, Long categoriaOrigemId, String categoriaOrigemNome, Long eventoDestinoId, String eventoDestinoNome, Long categoriaDestinoId, String categoriaDestinoNome, BigDecimal valorUsd, BigDecimal taxaCambio, BigDecimal valorBrl, String motivo, String usuarioNome, String usuarioEmail, OffsetDateTime criadoEm) {
        this.id = id;
        this.eventoOrigemId = eventoOrigemId;
        this.eventoOrigemNome = eventoOrigemNome;
        this.categoriaOrigemId = categoriaOrigemId;
        this.categoriaOrigemNome = categoriaOrigemNome;
        this.eventoDestinoId = eventoDestinoId;
        this.eventoDestinoNome = eventoDestinoNome;
        this.categoriaDestinoId = categoriaDestinoId;
        this.categoriaDestinoNome = categoriaDestinoNome;
        this.valorUsd = valorUsd;
        this.taxaCambio = taxaCambio;
        this.valorBrl = valorBrl;
        this.motivo = motivo;
        this.usuarioNome = usuarioNome;
        this.usuarioEmail = usuarioEmail;
        this.criadoEm = criadoEm;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long eventoOrigemId;
        private String eventoOrigemNome;
        private Long categoriaOrigemId;
        private String categoriaOrigemNome;
        private Long eventoDestinoId;
        private String eventoDestinoNome;
        private Long categoriaDestinoId;
        private String categoriaDestinoNome;
        private BigDecimal valorUsd;
        private BigDecimal taxaCambio;
        private BigDecimal valorBrl;
        private String motivo;
        private String usuarioNome;
        private String usuarioEmail;
        private OffsetDateTime criadoEm;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder eventoOrigemId(Long eventoOrigemId) { this.eventoOrigemId = eventoOrigemId; return this; }
        public Builder eventoOrigemNome(String eventoOrigemNome) { this.eventoOrigemNome = eventoOrigemNome; return this; }
        public Builder categoriaOrigemId(Long categoriaOrigemId) { this.categoriaOrigemId = categoriaOrigemId; return this; }
        public Builder categoriaOrigemNome(String categoriaOrigemNome) { this.categoriaOrigemNome = categoriaOrigemNome; return this; }
        public Builder eventoDestinoId(Long eventoDestinoId) { this.eventoDestinoId = eventoDestinoId; return this; }
        public Builder eventoDestinoNome(String eventoDestinoNome) { this.eventoDestinoNome = eventoDestinoNome; return this; }
        public Builder categoriaDestinoId(Long categoriaDestinoId) { this.categoriaDestinoId = categoriaDestinoId; return this; }
        public Builder categoriaDestinoNome(String categoriaDestinoNome) { this.categoriaDestinoNome = categoriaDestinoNome; return this; }
        public Builder valorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; return this; }
        public Builder taxaCambio(BigDecimal taxaCambio) { this.taxaCambio = taxaCambio; return this; }
        public Builder valorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; return this; }
        public Builder motivo(String motivo) { this.motivo = motivo; return this; }
        public Builder usuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; return this; }
        public Builder usuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public TransferenciaOrcamentoDTO build() {
            return new TransferenciaOrcamentoDTO(id, eventoOrigemId, eventoOrigemNome, categoriaOrigemId, categoriaOrigemNome, eventoDestinoId, eventoDestinoNome, categoriaDestinoId, categoriaDestinoNome, valorUsd, taxaCambio, valorBrl, motivo, usuarioNome, usuarioEmail, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventoOrigemId() { return eventoOrigemId; }
    public void setEventoOrigemId(Long eventoOrigemId) { this.eventoOrigemId = eventoOrigemId; }
    public String getEventoOrigemNome() { return eventoOrigemNome; }
    public void setEventoOrigemNome(String eventoOrigemNome) { this.eventoOrigemNome = eventoOrigemNome; }
    public Long getCategoriaOrigemId() { return categoriaOrigemId; }
    public void setCategoriaOrigemId(Long categoriaOrigemId) { this.categoriaOrigemId = categoriaOrigemId; }
    public String getCategoriaOrigemNome() { return categoriaOrigemNome; }
    public void setCategoriaOrigemNome(String categoriaOrigemNome) { this.categoriaOrigemNome = categoriaOrigemNome; }
    public Long getEventoDestinoId() { return eventoDestinoId; }
    public void setEventoDestinoId(Long eventoDestinoId) { this.eventoDestinoId = eventoDestinoId; }
    public String getEventoDestinoNome() { return eventoDestinoNome; }
    public void setEventoDestinoNome(String eventoDestinoNome) { this.eventoDestinoNome = eventoDestinoNome; }
    public Long getCategoriaDestinoId() { return categoriaDestinoId; }
    public void setCategoriaDestinoId(Long categoriaDestinoId) { this.categoriaDestinoId = categoriaDestinoId; }
    public String getCategoriaDestinoNome() { return categoriaDestinoNome; }
    public void setCategoriaDestinoNome(String categoriaDestinoNome) { this.categoriaDestinoNome = categoriaDestinoNome; }
    public BigDecimal getValorUsd() { return valorUsd; }
    public void setValorUsd(BigDecimal valorUsd) { this.valorUsd = valorUsd; }
    public BigDecimal getTaxaCambio() { return taxaCambio; }
    public void setTaxaCambio(BigDecimal taxaCambio) { this.taxaCambio = taxaCambio; }
    public BigDecimal getValorBrl() { return valorBrl; }
    public void setValorBrl(BigDecimal valorBrl) { this.valorBrl = valorBrl; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getUsuarioNome() { return usuarioNome; }
    public void setUsuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; }
    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
