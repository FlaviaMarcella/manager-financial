package com.aws.studentbuilder.finance.dto;

import java.time.OffsetDateTime;

public class LancamentoAnexoDTO {
    private Long id;
    private Long lancamentoId;
    private String url;
    private String nomeOriginal;
    private Long tamanhoBytes;
    private String contentType;
    private OffsetDateTime criadoEm;

    public LancamentoAnexoDTO() {}

    public LancamentoAnexoDTO(Long id, Long lancamentoId, String url, String nomeOriginal, Long tamanhoBytes, String contentType, OffsetDateTime criadoEm) {
        this.id = id;
        this.lancamentoId = lancamentoId;
        this.url = url;
        this.nomeOriginal = nomeOriginal;
        this.tamanhoBytes = tamanhoBytes;
        this.contentType = contentType;
        this.criadoEm = criadoEm;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long lancamentoId;
        private String url;
        private String nomeOriginal;
        private Long tamanhoBytes;
        private String contentType;
        private OffsetDateTime criadoEm;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder lancamentoId(Long lancamentoId) { this.lancamentoId = lancamentoId; return this; }
        public Builder url(String url) { this.url = url; return this; }
        public Builder nomeOriginal(String nomeOriginal) { this.nomeOriginal = nomeOriginal; return this; }
        public Builder tamanhoBytes(Long tamanhoBytes) { this.tamanhoBytes = tamanhoBytes; return this; }
        public Builder contentType(String contentType) { this.contentType = contentType; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public LancamentoAnexoDTO build() {
            return new LancamentoAnexoDTO(id, lancamentoId, url, nomeOriginal, tamanhoBytes, contentType, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLancamentoId() { return lancamentoId; }
    public void setLancamentoId(Long lancamentoId) { this.lancamentoId = lancamentoId; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getNomeOriginal() { return nomeOriginal; }
    public void setNomeOriginal(String nomeOriginal) { this.nomeOriginal = nomeOriginal; }
    public Long getTamanhoBytes() { return tamanhoBytes; }
    public void setTamanhoBytes(Long tamanhoBytes) { this.tamanhoBytes = tamanhoBytes; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
}
