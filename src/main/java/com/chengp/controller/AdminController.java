package com.chengp.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Created by pc on 3/22/16.
 */
@RestController
public class AdminController {

    @RequestMapping("/admin")
    public Principal admin(Principal principal) {
        return principal;
    }
}