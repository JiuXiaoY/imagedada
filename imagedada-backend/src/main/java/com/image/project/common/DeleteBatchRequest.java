package com.image.project.common;

import lombok.Data;

import java.io.Serializable;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/7/5
 */
@Data
public class DeleteBatchRequest implements Serializable {

    /**
     * id
     */
    private Long[] ids;

    private static final long serialVersionUID = 1L;
}