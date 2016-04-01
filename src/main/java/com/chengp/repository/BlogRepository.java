package com.chengp.repository;

import com.chengp.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by pc on 3/20/16.
 */
@Repository
public interface BlogRepository extends JpaRepository<Post, Integer>{

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    void delete(Integer id);


    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    Post save(Post post);

}
