package com.image.project.model.dto.question;

import lombok.Data;

import java.io.Serializable;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/7/1
 */
@Data
public class QuestionAnswerDTO implements Serializable {
    /**
     * 题目
     */
    private String title;

    /**
     * 用户答案
     */
    private String userAnswer;

    // 序列化字段
    private static final long serialVersionUID = 1L;
}
