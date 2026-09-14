package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.Brinde;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrindeRepository extends JpaRepository<Brinde, Long> {
    List<Brinde> findByEventoDistribuicaoId(Long eventoId);
    List<Brinde> findByOrigemParceriaId(Long parceriaId);
}
