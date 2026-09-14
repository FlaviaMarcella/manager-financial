package com.aws.studentbuilder.finance.entity.converter;

import com.aws.studentbuilder.finance.entity.TipoParceria;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TipoParceriaConverter implements AttributeConverter<TipoParceria, String> {

    @Override
    public String convertToDatabaseColumn(TipoParceria attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public TipoParceria convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        for (TipoParceria t : TipoParceria.values()) {
            if (t.name().equalsIgnoreCase(dbData.trim())) {
                return t;
            }
        }
        return TipoParceria.FINANCEIRA;
    }
}
