package com.chengp.repository;

import com.chengp.entity.Post;
import com.chengp.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by pc on 4/4/16.
 */
@Repository
@Transactional
public interface TagRepository extends JpaRepository<Tag,Integer>{

    @RestResource(exported = false)
    @Query("SELECT distinct t.name,t.color FROM Tag t")
    List<Tag> findDistincted();
}
