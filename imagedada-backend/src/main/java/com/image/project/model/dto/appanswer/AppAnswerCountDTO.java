package com.image.project.model.dto.appanswer;

import lombok.Data;

import java.io.Serializable;

/**
 * App 用户提交答案书统计
 */
@Data
public class AppAnswerCountDTO implements Serializable {

    private Long appId;

    /**
     * 用户提交答案数
     */
    private Long answerCount;

    // 序列化字段
    private static final long serialVersionUID = 1L;
}