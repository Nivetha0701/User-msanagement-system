package com.Ajcode.spring_boot_demo.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> getApiRoot() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("service", "User Management System API");
        info.put("status", "UP");
        info.put("version", "1.0.0");
        info.put("endpoints", Map.of(
            "users", "/api/users",
            "swaggerUi", "/swagger-ui/index.html"
        ));
        info.put("frontend", "https://user-msanagement-system.vercel.app");
        return ResponseEntity.ok(info);
    }
}
