package com.image.project.scoring;

import org.springframework.stereotype.Component;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/6/23
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Component
public @interface ScoringStrategyConfig {
    /**
     * 应用类型
     *
     * @return
     */
    int appType();

    /**
     * 评分策略
     *
     * @return
     */
    int scoringStrategy();
}
