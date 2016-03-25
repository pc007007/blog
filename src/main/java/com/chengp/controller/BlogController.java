package com.chengp.controller;

import com.chengp.entity.Post;
import com.chengp.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by pc on 3/18/16.
 */
@RestController
public class BlogController {

/*    @Autowired
    private BlogRepository blogRepository;

    @RequestMapping("/api/blog/recent")
    public List<Post> getRecentPost() {
        return blogRepository.findTop4ByAuthorOrderByPubDateDesc("pc");
    }

    @RequestMapping("/api/blog")
    public List<Post> getAllPost(){

        return blogRepository.findAllByAuthorOrderByPubDateDesc("pc");
    }

    @RequestMapping(value = "/api/blog",method = RequestMethod.POST)
    public ResponseEntity<Void> putPost(@RequestBody Post post){

        blogRepository.save(post);
        HttpHeaders headers = new HttpHeaders();
        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    @RequestMapping("/api/blog/{id}")
    public Post getPost(@PathVariable("id") Integer id) {

        return blogRepository.findOne(id);
    }*/

}
