package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.Lancamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LancamentoRepository extends JpaRepository<Lancamento, Long>, JpaSpecificationExecutor<Lancamento> {

    List<Lancamento> findByEventoId(Long eventoId);
    List<Lancamento> findByCategoriaId(Long categoriaId);
    List<Lancamento> findByEventoIdAndCategoriaId(Long eventoId, Long categoriaId);

    @Query("SELECT SUM(l.valorBrl) FROM Lancamento l")
    BigDecimal sumTotalGastoBrl();

    @Query("SELECT SUM(l.valorUsd) FROM Lancamento l")
    BigDecimal sumTotalGastoUsd();

    @Query("SELECT SUM(l.valorBrl) FROM Lancamento l WHERE l.evento.id = :eventoId")
    BigDecimal sumGastoBrlByEventoId(@Param("eventoId") Long eventoId);

    @Query("SELECT SUM(l.valorBrl) FROM Lancamento l WHERE l.evento.id = :eventoId AND l.categoria.id = :categoriaId")
    BigDecimal sumGastoBrlByEventoIdAndCategoriaId(@Param("eventoId") Long eventoId, @Param("categoriaId") Long categoriaId);

    @Query("SELECT SUM(l.valorUsd) FROM Lancamento l WHERE l.evento.id = :eventoId AND l.categoria.id = :categoriaId")
    BigDecimal sumGastoUsdByEventoIdAndCategoriaId(@Param("eventoId") Long eventoId, @Param("categoriaId") Long categoriaId);

    @Query("SELECT l.categoria.nome, SUM(l.valorBrl) FROM Lancamento l GROUP BY l.categoria.nome")
    List<Object[]> sumGastoBrlGroupedByCategoria();

    @Query("SELECT l.evento.id, l.evento.nome, SUM(l.valorBrl) FROM Lancamento l GROUP BY l.evento.id, l.evento.nome")
    List<Object[]> sumGastoBrlGroupedByEvento();
}
