package com.image.project.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/6/23
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewRequest implements Serializable {

    /**
     * 应用id
     */
    private Long id;

    /**
     * 审核状态
     */
    private Integer reviewStatus;

    /**
     * 审核信息
     */
    private String reviewMessage;

    // 序列化字段
    private static final long serialVersionUID = 1L;
}
