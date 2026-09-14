package com.aws.studentbuilder.finance.dto;

import com.aws.studentbuilder.finance.entity.StatusEvento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EventoDTO {
    private Long id;

    @NotBlank(message = "Nome do evento é obrigatório")
    private String nome;

    @NotNull(message = "Data do evento é obrigatória")
    private LocalDate data;

    private StatusEvento status = StatusEvento.PLANEJADO;

    public EventoDTO() {}

    public EventoDTO(Long id, String nome, LocalDate data, StatusEvento status) {
        this.id = id;
        this.nome = nome;
        this.data = data;
        this.status = status != null ? status : StatusEvento.PLANEJADO;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String nome;
        private LocalDate data;
        private StatusEvento status = StatusEvento.PLANEJADO;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder nome(String nome) { this.nome = nome; return this; }
        public Builder data(LocalDate data) { this.data = data; return this; }
        public Builder status(StatusEvento status) { this.status = status; return this; }
        public EventoDTO build() { return new EventoDTO(id, nome, data, status); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public StatusEvento getStatus() { return status; }
    public void setStatus(StatusEvento status) { this.status = status; }
}
