package com.aws.studentbuilder.finance.entity.converter;

import com.aws.studentbuilder.finance.entity.StatusEvento;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusEventoConverter implements AttributeConverter<StatusEvento, String> {

    @Override
    public String convertToDatabaseColumn(StatusEvento attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public StatusEvento convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        for (StatusEvento s : StatusEvento.values()) {
            if (s.name().equalsIgnoreCase(dbData.trim())) {
                return s;
            }
        }
        return StatusEvento.PLANEJADO;
    }
}
