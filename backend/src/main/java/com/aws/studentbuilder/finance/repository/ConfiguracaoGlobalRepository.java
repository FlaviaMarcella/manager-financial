package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.ConfiguracaoGlobal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracaoGlobalRepository extends JpaRepository<ConfiguracaoGlobal, Long> {
}
