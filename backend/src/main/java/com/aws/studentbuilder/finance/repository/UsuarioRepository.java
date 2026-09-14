package com.aws.studentbuilder.finance.repository;

import com.aws.studentbuilder.finance.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByGoogleSub(String googleSub);
    boolean existsByEmail(String email);
}
