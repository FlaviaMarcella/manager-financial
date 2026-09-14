package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.Parceria;
import com.aws.studentbuilder.finance.entity.StatusParceria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ParceriaRepository extends JpaRepository<Parceria, Long> {
    List<Parceria> findByStatus(StatusParceria status);
    List<Parceria> findByEventoId(Long eventoId);

    @Query("SELECT SUM(p.valorContrapartida) FROM Parceria p WHERE p.status = 'FECHADO' OR p.status = 'ENTREGUE'")
    BigDecimal sumTotalRecebidoParcerias();

    @Query("SELECT p.status, COUNT(p) FROM Parceria p GROUP BY p.status")
    List<Object[]> countGroupedByStatus();
}
