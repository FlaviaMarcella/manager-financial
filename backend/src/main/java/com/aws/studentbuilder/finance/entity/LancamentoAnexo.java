package com.aws.studentbuilder.finance.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "lancamento_anexos")
public class LancamentoAnexo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lancamento_id", nullable = false)
    private Lancamento lancamento;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(name = "nome_original", nullable = false, length = 255)
    private String nomeOriginal;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    public LancamentoAnexo() {}

    public LancamentoAnexo(Long id, Lancamento lancamento, String url, String nomeOriginal, Long tamanhoBytes, String contentType, OffsetDateTime criadoEm) {
        this.id = id;
        this.lancamento = lancamento;
        this.url = url;
        this.nomeOriginal = nomeOriginal;
        this.tamanhoBytes = tamanhoBytes;
        this.contentType = contentType;
        this.criadoEm = criadoEm != null ? criadoEm : OffsetDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Lancamento lancamento;
        private String url;
        private String nomeOriginal;
        private Long tamanhoBytes;
        private String contentType;
        private OffsetDateTime criadoEm = OffsetDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder lancamento(Lancamento lancamento) { this.lancamento = lancamento; return this; }
        public Builder url(String url) { this.url = url; return this; }
        public Builder nomeOriginal(String nomeOriginal) { this.nomeOriginal = nomeOriginal; return this; }
        public Builder tamanhoBytes(Long tamanhoBytes) { this.tamanhoBytes = tamanhoBytes; return this; }
        public Builder contentType(String contentType) { this.contentType = contentType; return this; }
        public Builder criadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; return this; }
        public LancamentoAnexo build() {
            return new LancamentoAnexo(id, lancamento, url, nomeOriginal, tamanhoBytes, contentType, criadoEm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Lancamento getLancamento() { return lancamento; }
    public void setLancamento(Lancamento lancamento) { this.lancamento = lancamento; }
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
