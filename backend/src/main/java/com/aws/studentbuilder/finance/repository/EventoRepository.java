package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.Evento;
import com.aws.studentbuilder.finance.entity.StatusEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByStatus(StatusEvento status);
    List<Evento> findAllByOrderByDataDesc();
}
