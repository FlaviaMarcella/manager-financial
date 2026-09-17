package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.LancamentoAnexo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LancamentoAnexoRepository extends JpaRepository<LancamentoAnexo, Long> {
    List<LancamentoAnexo> findByLancamentoId(Long lancamentoId);
}
