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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class CotacaoMoedaService {

    private static final Logger log = LoggerFactory.getLogger(CotacaoMoedaService.class);
    private static final String AWESOME_API_URL = "https://economia.awesomeapi.com.br/last/USD-BRL";
    private static final String OPEN_ER_API_URL = "https://open.er-api.com/v6/latest/USD";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    // Cache simples em memória (TTL 60 segundos)
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

    public CotacaoDolarDTO obterCotacaoDolarAtual() {
        return obterCotacaoDolarAtual(false);
    }

    public synchronized CotacaoDolarDTO obterCotacaoDolarAtual(boolean forceRefresh) {
        if (!forceRefresh && cachedCotacao != null && lastFetchTime != null &&
                lastFetchTime.isAfter(LocalDateTime.now().minusSeconds(60))) {
            return cachedCotacao;
        }

        // 1. Tenta AwesomeAPI Comercial em Tempo Real
        try {
            String jsonResponse = restClient.get()
                    .uri(AWESOME_API_URL)
                    .retrieve()
                    .body(String.class);

            if (jsonResponse != null && !jsonResponse.isBlank()) {
                JsonNode root = objectMapper.readTree(jsonResponse);
                JsonNode usdNode = root.path("USDBRL");
                if (!usdNode.isMissingNode()) {
                    BigDecimal bid = new BigDecimal(usdNode.path("bid").asText("5.1500"));
                    BigDecimal high = new BigDecimal(usdNode.path("high").asText(bid.toString()));
                    BigDecimal low = new BigDecimal(usdNode.path("low").asText(bid.toString()));
                    BigDecimal varBid = new BigDecimal(usdNode.path("varBid").asText("0.0000"));
                    BigDecimal pctChange = new BigDecimal(usdNode.path("pctChange").asText("0.00"));
                    String createDate = usdNode.path("create_date").asText(LocalDateTime.now().format(FORMATTER));

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
                    log.info("Cotação do Dólar atualizada com sucesso via AwesomeAPI: R$ {}", bid);
                    return cachedCotacao;
                }
            }
        } catch (Exception e) {
            log.warn("AwesomeAPI indisponível ou com erro: {}. Tentando provedor de fallback...", e.getMessage());
        }

        // 2. Fallback Secundário: Open Exchange Rates
        try {
            String jsonResponse = restClient.get()
                    .uri(OPEN_ER_API_URL)
                    .retrieve()
                    .body(String.class);

            if (jsonResponse != null && !jsonResponse.isBlank()) {
                JsonNode root = objectMapper.readTree(jsonResponse);
                JsonNode ratesNode = root.path("rates");
                if (!ratesNode.isMissingNode() && ratesNode.has("BRL")) {
                    BigDecimal brlRate = new BigDecimal(ratesNode.path("BRL").asText("5.1500")).setScale(4, RoundingMode.HALF_UP);
                    String timeUtc = root.path("time_last_update_utc").asText(LocalDateTime.now().format(FORMATTER));

                    cachedCotacao = CotacaoDolarDTO.builder()
                            .cotacaoOficial(brlRate)
                            .maximo(brlRate)
                            .minimo(brlRate)
                            .variacao(BigDecimal.ZERO)
                            .pctChange(BigDecimal.ZERO)
                            .dataHoraCotacao(timeUtc)
                            .fonte("ExchangeRate-API Global")
                            .build();
                    lastFetchTime = LocalDateTime.now();
                    log.info("Cotação do Dólar obtida via ExchangeRate-API: R$ {}", brlRate);
                    return cachedCotacao;
                }
            }
        } catch (Exception e) {
            log.warn("Falha no fallback ExchangeRate-API: {}", e.getMessage());
        }

        if (cachedCotacao != null) {
            return cachedCotacao;
        }

        // 3. Fallback de contingência
        return CotacaoDolarDTO.builder()
                .cotacaoOficial(new BigDecimal("5.1500"))
                .maximo(new BigDecimal("5.2000"))
                .minimo(new BigDecimal("5.1000"))
                .variacao(BigDecimal.ZERO)
                .pctChange(BigDecimal.ZERO)
                .dataHoraCotacao(LocalDateTime.now().format(FORMATTER))
                .fonte("Referência de Contingência")
                .build();
    }
}
