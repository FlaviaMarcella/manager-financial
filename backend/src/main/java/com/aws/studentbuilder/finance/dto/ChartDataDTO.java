package com.aws.studentbuilder.finance.dto;

import java.math.BigDecimal;

public class ChartDataDTO {
    private String label;
    private BigDecimal value;
    private BigDecimal secondaryValue;
    private String color;

    public ChartDataDTO() {}

    public ChartDataDTO(String label, BigDecimal value, BigDecimal secondaryValue, String color) {
        this.label = label;
        this.value = value;
        this.secondaryValue = secondaryValue;
        this.color = color;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String label;
        private BigDecimal value;
        private BigDecimal secondaryValue;
        private String color;

        public Builder label(String label) { this.label = label; return this; }
        public Builder value(BigDecimal value) { this.value = value; return this; }
        public Builder secondaryValue(BigDecimal secondaryValue) { this.secondaryValue = secondaryValue; return this; }
        public Builder color(String color) { this.color = color; return this; }
        public ChartDataDTO build() { return new ChartDataDTO(label, value, secondaryValue, color); }
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public BigDecimal getSecondaryValue() { return secondaryValue; }
    public void setSecondaryValue(BigDecimal secondaryValue) { this.secondaryValue = secondaryValue; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
