package com.aws.studentbuilder.finance.entity.converter;

import com.aws.studentbuilder.finance.entity.PapelUsuario;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PapelUsuarioConverter implements AttributeConverter<PapelUsuario, String> {

    @Override
    public String convertToDatabaseColumn(PapelUsuario attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public PapelUsuario convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        for (PapelUsuario p : PapelUsuario.values()) {
            if (p.name().equalsIgnoreCase(dbData.trim())) {
                return p;
            }
        }
        return PapelUsuario.VIEWER;
    }
}
