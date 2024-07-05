package com.image.project.config;

import io.reactivex.Scheduler;
import io.reactivex.schedulers.Schedulers;
import lombok.Data;
import org.jetbrains.annotations.NotNull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * vip线程池配置
 *
 * @author JXY
 * @version 1.0
 * @since 2024/7/3
 */
@Configuration
@Data
public class VipSchedulerConfig {


    @Bean
    public Scheduler vipScheduler() {
        ThreadFactory threadFactory = new ThreadFactory() {
            private final AtomicInteger threadNumber = new AtomicInteger(1);

            @Override
            public Thread newThread(@NotNull Runnable r) {
                Thread thread = new Thread(r);
                thread.setName("vip_threadPool_" + threadNumber.getAndIncrement());
                thread.setDaemon(false);
                return thread;
            }
        };

        ExecutorService vipThreadPool = Executors.newScheduledThreadPool(10, threadFactory);
        return Schedulers.from(vipThreadPool);
    }
}
