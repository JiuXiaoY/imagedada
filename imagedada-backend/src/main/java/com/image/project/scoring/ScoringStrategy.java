package com.image.project.scoring;

import com.image.project.model.entity.App;
import com.image.project.model.entity.UserAnswer;

import java.util.List;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/6/23
 */
public interface ScoringStrategy {
    /**
     * 评分
     * @param choices 选择
     * @param app 应用
     * @return userAnswer
     */
    UserAnswer doScore(List<String> choices, App app);
}
