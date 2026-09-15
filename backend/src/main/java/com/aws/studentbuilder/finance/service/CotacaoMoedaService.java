package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.dto.CotacaoDolarDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class CotacaoMoedaService {

    private static final Logger log = LoggerFactory.getLogger(CotacaoMoedaService.class);
    private static final String API_URL = "https://economia.awesomeapi.com.br/last/USD-BRL";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    // Cache simples em memória (TTL 5 minutos)
    private CotacaoDolarDTO cachedCotacao;
    private LocalDateTime lastFetchTime;

    public CotacaoMoedaService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(4000);
        requestFactory.setReadTimeout(4000);
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    public synchronized CotacaoDolarDTO obterCotacaoDolarAtual() {
        if (cachedCotacao != null && lastFetchTime != null &&
                lastFetchTime.isAfter(LocalDateTime.now().minusMinutes(5))) {
            return cachedCotacao;
        }

        try {
            String jsonResponse = restClient.get()
                    .uri(API_URL)
                    .retrieve()
                    .body(String.class);

            if (jsonResponse != null && !jsonResponse.isBlank()) {
                JsonNode root = objectMapper.readTree(jsonResponse);
                JsonNode usdNode = root.path("USDBRL");
                if (!usdNode.isMissingNode()) {
                    BigDecimal bid = new BigDecimal(usdNode.path("bid").asText("5.5000"));
                    BigDecimal high = new BigDecimal(usdNode.path("high").asText("5.5000"));
                    BigDecimal low = new BigDecimal(usdNode.path("low").asText("5.5000"));
                    BigDecimal varBid = new BigDecimal(usdNode.path("varBid").asText("0.0000"));
                    BigDecimal pctChange = new BigDecimal(usdNode.path("pctChange").asText("0.00"));
                    String createDate = usdNode.path("create_date").asText(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                    cachedCotacao = CotacaoDolarDTO.builder()
                            .cotacaoOficial(bid)
                            .maximo(high)
                            .minimo(low)
                            .variacao(varBid)
                            .pctChange(pctChange)
                            .dataHoraCotacao(createDate)
                            .fonte("AwesomeAPI / Mercado Financeiro Comercial")
                            .build();
                    lastFetchTime = LocalDateTime.now();
                    log.info("Cotação do Dólar atualizada com sucesso: R$ {}", bid);
                    return cachedCotacao;
                }
            }
        } catch (Exception e) {
            log.warn("Não foi possível obter cotação ao vivo do Dólar: {}. Utilizando valor de contingência.", e.getMessage());
        }

        if (cachedCotacao != null) {
            return cachedCotacao;
        }

        // Fallback de contingência
        return CotacaoDolarDTO.builder()
                .cotacaoOficial(new BigDecimal("5.5000"))
                .maximo(new BigDecimal("5.5500"))
                .minimo(new BigDecimal("5.4500"))
                .variacao(BigDecimal.ZERO)
                .pctChange(BigDecimal.ZERO)
                .dataHoraCotacao(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .fonte("Referência de Contingência")
                .build();
    }
}
