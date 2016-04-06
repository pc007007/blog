package com.chengp.controller;

import com.chengp.entity.Tag;
import com.chengp.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

/**
 * Created by pc on 3/22/16.
 */
@RestController
public class AdminController {

    @Autowired
    private TagRepository tagRepository;

    @RequestMapping("/admin")
    public Principal admin(Principal principal) {
        return principal;
    }

    @RequestMapping("/api/tags/distinct")
    public List<Tag> getTags() {
        return tagRepository.findDistincted();
    }
}