package com.image.project.controller;

import cn.hutool.core.util.RandomUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.image.project.common.BaseResponse;
import com.image.project.common.ErrorCode;
import com.image.project.common.ResultUtils;
import com.image.project.common.SmsRequest;
import com.image.project.exception.BusinessException;
import com.image.project.exception.ThrowUtils;
import com.image.project.manager.DysmsManager;
import com.image.project.model.entity.User;
import com.image.project.model.entity.Verificationcode;
import com.image.project.service.UserService;
import com.image.project.service.VerificationcodeService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/7/4
 */
@RestController
@RequestMapping("/sms")
public class SmsController {

    @Resource
    private DysmsManager dysmsManager;

    @Resource
    private UserService userService;

    @Resource
    private VerificationcodeService verificationcodeService;

    @PostMapping("/sendSms")
    public BaseResponse<Boolean> sendSms(@RequestBody SmsRequest smsRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(smsRequest == null, ErrorCode.PARAMS_ERROR);
        String phone = smsRequest.getPhoneNumber();

        // 校验手机号
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("phone", phone);
        User user = userService.getOne(queryWrapper);
        ThrowUtils.throwIf(user == null, ErrorCode.PARAMS_ERROR, "手机号不存在");

        // 为了确保是本人登录，需要校验短信验证码
        String code;
        try {
            // 生成四位纯数字的验证码
            code = RandomUtil.randomNumbers(6);
            dysmsManager.sendSms(phone, code);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "发送验证码失败");
        }

        // 保存到数据库
        Verificationcode verificationcode = new Verificationcode();
        verificationcode.setCode(code);
        verificationcode.setPhoneNumber(phone);
        boolean saveRes = verificationcodeService.save(verificationcode);

        ThrowUtils.throwIf(!saveRes, ErrorCode.SYSTEM_ERROR, "保存验证码失败");

        return ResultUtils.success(true);
    }
}
