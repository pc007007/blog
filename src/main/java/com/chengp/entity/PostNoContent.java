package com.chengp.entity;

import org.springframework.data.rest.core.config.Projection;

import java.util.Date;
import java.util.List;

/**
 * Created by pc on 4/1/16.
 */
@Projection(name = "noContent", types = {Post.class})
interface PostNoContent {

    Integer getId();

    String getTitle();

    String getAuthor();

    Date getPubDate();

    List<Tag> getTags();
}
