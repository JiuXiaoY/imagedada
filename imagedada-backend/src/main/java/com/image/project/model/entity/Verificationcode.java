package com.image.project.model.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 验证码
 * @TableName VerificationCode
 */
@TableName(value ="VerificationCode")
@Data
public class Verificationcode implements Serializable {
    /**
     * id 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 手机号
     */
    private String phoneNumber;

    /**
     * 验证码
     */
    private String code;

    /**
     * 创建时间
     */
    private Date createdAt;

    /**
     * 是否删除
     */
    @TableLogic
    private Integer isDelete;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}