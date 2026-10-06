package com.Ajcode.spring_boot_demo;

import com.Ajcode.spring_boot_demo.Repository.UserRepository;
import com.Ajcode.spring_boot_demo.entity.UserEntity;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SpringBootDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringBootDemoApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository) {
		return args -> {
			try {
				if (userRepository.count() == 0) {
					userRepository.save(new UserEntity(null, "Nivetha Balasundaram", "nivetha@example.com"));
					userRepository.save(new UserEntity(null, "Alex Rivera", "alex.rivera@techcorp.io"));
					userRepository.save(new UserEntity(null, "Sophia Chen", "sophia.chen@designhub.co"));
				}
			} catch (Exception e) {
				System.err.println("Seed database notice: " + e.getMessage());
			}
		};
	}

}
