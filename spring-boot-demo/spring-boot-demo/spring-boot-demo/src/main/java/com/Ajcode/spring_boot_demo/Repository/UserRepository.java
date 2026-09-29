
package com.Ajcode.spring_boot_demo.Repository;

import com.Ajcode.spring_boot_demo.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository <UserEntity,Long>{


}
