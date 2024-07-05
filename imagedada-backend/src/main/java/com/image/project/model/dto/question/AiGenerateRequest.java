package com.image.project.model.dto.question;

import lombok.Data;

import java.io.Serializable;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/7/1
 */
@Data
public class AiGenerateRequest implements Serializable {

    private Long appId;

    int questionNum = 10;

    int optionNum = 2;

    // 序列化字段
    private static final long serialVersionUID = 1L;
}
