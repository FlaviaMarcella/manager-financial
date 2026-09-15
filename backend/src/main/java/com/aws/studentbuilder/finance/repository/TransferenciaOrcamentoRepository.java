package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.TransferenciaOrcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransferenciaOrcamentoRepository extends JpaRepository<TransferenciaOrcamento, Long> {

    @Query("SELECT t FROM TransferenciaOrcamento t " +
           "LEFT JOIN FETCH t.eventoOrigem " +
           "LEFT JOIN FETCH t.categoriaOrigem " +
           "LEFT JOIN FETCH t.eventoDestino " +
           "LEFT JOIN FETCH t.categoriaDestino " +
           "LEFT JOIN FETCH t.usuario " +
           "WHERE (:eventoId IS NULL OR t.eventoOrigem.id = :eventoId OR t.eventoDestino.id = :eventoId) " +
           "ORDER BY t.criadoEm DESC")
    List<TransferenciaOrcamento> findByEventoId(@Param("eventoId") Long eventoId);
}
