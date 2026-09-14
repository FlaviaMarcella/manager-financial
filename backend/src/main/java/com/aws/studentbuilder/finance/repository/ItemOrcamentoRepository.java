package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.ItemOrcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemOrcamentoRepository extends JpaRepository<ItemOrcamento, Long> {
    List<ItemOrcamento> findByEventoId(Long eventoId);
    Optional<ItemOrcamento> findByEventoIdAndCategoriaId(Long eventoId, Long categoriaId);

    @Query("SELECT SUM(i.valorOrcadoUsd * i.taxaCambioUsada) FROM ItemOrcamento i")
    BigDecimal sumTotalOrcadoBrl();

    @Query("SELECT SUM(i.valorOrcadoUsd) FROM ItemOrcamento i")
    BigDecimal sumTotalOrcadoUsd();

    @Query("SELECT SUM(i.valorOrcadoUsd * i.taxaCambioUsada) FROM ItemOrcamento i WHERE i.evento.id = :eventoId")
    BigDecimal sumOrcadoBrlByEventoId(@Param("eventoId") Long eventoId);
}
