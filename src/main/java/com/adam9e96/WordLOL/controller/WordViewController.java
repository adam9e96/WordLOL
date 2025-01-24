package com.adam9e96.WordLOL.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/word")
public class WordViewController {

    @RequestMapping("/study")
    public String showStudy() {

        return "study";
    }
}
