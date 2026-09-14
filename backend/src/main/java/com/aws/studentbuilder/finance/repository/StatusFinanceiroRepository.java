package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.StatusFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatusFinanceiroRepository extends JpaRepository<StatusFinanceiro, Long> {
    Optional<StatusFinanceiro> findByNomeIgnoreCase(String nome);
}
