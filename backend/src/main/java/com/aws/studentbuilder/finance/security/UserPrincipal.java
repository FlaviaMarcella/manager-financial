package com.aws.studentbuilder.finance.security;

import com.aws.studentbuilder.finance.entity.PapelUsuario;
import com.aws.studentbuilder.finance.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String nome;
    private final PapelUsuario papel;
    private final boolean ativo;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String email, String nome, PapelUsuario papel, boolean ativo, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.nome = nome;
        this.papel = papel;
        this.ativo = ativo;
        this.authorities = authorities;
    }

    public static UserPrincipal create(Usuario usuario) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + usuario.getPapel().name());
        return new UserPrincipal(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNome(),
                usuario.getPapel(),
                usuario.isAtivo(),
                Collections.singletonList(authority)
        );
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public PapelUsuario getPapel() { return papel; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return ativo;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }
}
