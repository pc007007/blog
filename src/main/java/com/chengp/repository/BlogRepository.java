package com.chengp.repository;

import com.chengp.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.hateoas.ExposesResourceFor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by pc on 3/20/16.
 */
@Repository
public interface BlogRepository extends JpaRepository<Post, Integer>{

    List<Post> findTop4ByAuthorOrderByPubDateDesc(@Param("author") String author);

    List<Post> findAllByAuthorOrderByPubDateDesc(@Param("author") String author);

}
