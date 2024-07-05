package com.image.project.model.dto.appanswer;

import lombok.Data;

import java.io.Serializable;

/**
 * App 答案结果统计
 */
@Data
public class AppAnswerResultCountDTO implements Serializable {
    // 结果名称
    private String resultName;
    // 对应个数
    private String resultCount;

    // 序列化字段
    private static final long serialVersionUID = 1L;
}