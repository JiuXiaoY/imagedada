package com.image.project.common;

import lombok.Data;

import java.io.Serializable;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/7/4
 */
@Data
public class SmsRequest implements Serializable {
    private String phoneNumber;

    public static final Long SerialVersionUID = 1L;
}
