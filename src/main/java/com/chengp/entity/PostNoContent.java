package com.chengp.entity;

import org.springframework.data.rest.core.config.Projection;

/**
 * Created by pc on 4/1/16.
 */
@Projection(name = "noContent", types = {Post.class})
interface PostNoContent {

    Integer getId();

    String getTitle();

    String getAuthor();

    String getPubDate();
}
