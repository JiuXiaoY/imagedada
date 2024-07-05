package com.image.project.model.dto.verificationcode;

import lombok.Data;

import java.io.Serializable;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/7/4
 */

@Data
public class VerifyRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    private String phoneNumber;

    private String code;
}
