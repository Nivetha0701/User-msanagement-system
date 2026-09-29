package com.Ajcode.spring_boot_demo.Controller;

import com.Ajcode.spring_boot_demo.Repository.UserRepository;
import com.Ajcode.spring_boot_demo.entity.UserEntity;
import com.Ajcode.spring_boot_demo.exception.ResourceNotFound;
import com.Ajcode.spring_boot_demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<UserEntity> getUsers() {
//        return Arrays.asList(new User(1L,"Ajmal","Ajmal25k@gmail.com"),new User(2L,"Buffalo","Buffalo25k@gmail.com"),new User(3L,"Buffalo2","Buffalo225k@gmail.com"));
     return userRepository.findAll();
    }

    @PostMapping
    public UserEntity createUser(@RequestBody UserEntity user){
//        System.out.println("user data"+user.getName()+","+user.getEmail());

        return userRepository.save(user);
    }
    @GetMapping("/{id}")
    public UserEntity getUserById(@PathVariable Long id) {
        return userRepository.findById(id).orElseThrow(()-> new ResourceNotFound("USER NOT FOUND WITH THIS ID:"+id));

    }
    @PutMapping("/{id}")
    public UserEntity updateUser(@PathVariable Long id, @RequestBody UserEntity user){
        UserEntity userData=userRepository.findById(id).orElseThrow(()-> new ResourceNotFound("USER NOT FOUND WITH THIS ID:"+id));
        userData.setEmail(user.getEmail());
        userData.setName(user.getName());
        return userRepository.save(userData);
    }
    @DeleteMapping("/{id}")
    public  ResponseEntity<?> deleteUser(@PathVariable Long id){
        UserEntity userData=userRepository.findById(id).orElseThrow(()-> new ResourceNotFound("USER NOT FOUND WITH THIS ID:"+id));
        userRepository.delete(userData);
        return ResponseEntity.ok().build();

    }
}
