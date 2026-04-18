package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;


    @Override
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    @Transactional
    public User saveUser(User user) {
        if (user.getId() == null) {
            user.setActive(1); 
            UserRole role = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
            user.setRole(role);
            return userRepository.save(user);
        } else {
            return userRepository.findById(user.getId()).map(existingUser -> {
                existingUser.setUserName(user.getUserName());
                existingUser.setActive(user.getActive()); 
                return userRepository.save(existingUser);
            }).orElseGet(() -> userRepository.save(user));
        }
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByUserDetailsEmail(email);
    }

    @Override
    public void updatePassword(String email, String newPassword) {
        User user = userRepository.findByUserDetailsEmail(email);
        if (user != null) {
            user.setUserPassword(newPassword);
            userRepository.save(user);
        }
    }
}