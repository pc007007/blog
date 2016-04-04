package com.chengp.entity;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by pc on 3/20/16.
 */
@Entity
@Table(name = "post")
public class Post {

    @Id @GeneratedValue
    private Integer id;

    @Column(name = "title",nullable = false)
    private String title;

    @Column(name = "author")
    private String author;

    @Column(name = "publish_date")
    private Date pubDate;

    @Lob
    @Column(name = "content", length = 100000)
    private String content;


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Date getPubDate() {
        return pubDate;
    }

    public void setPubDate(Date pubDate) {
        this.pubDate = pubDate;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
