package com.aws.studentbuilder.finance.entity.converter;

import com.aws.studentbuilder.finance.entity.StatusParceria;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusParceriaConverter implements AttributeConverter<StatusParceria, String> {

    @Override
    public String convertToDatabaseColumn(StatusParceria attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public StatusParceria convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        for (StatusParceria s : StatusParceria.values()) {
            if (s.name().equalsIgnoreCase(dbData.trim())) {
                return s;
            }
        }
        return StatusParceria.NEGOCIACAO;
    }
}
