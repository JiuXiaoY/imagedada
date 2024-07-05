package com.image.project.manager;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/7/4
 */
@SpringBootTest
class DysmsManagerTest {

    @Resource
    private DysmsManager dysmsManager;

    @Test
    void sendSms() {
        try {
            // dysmsManager.sendSms("18718243755");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}