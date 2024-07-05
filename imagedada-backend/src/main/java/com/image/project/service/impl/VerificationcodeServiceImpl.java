package com.image.project.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.image.project.common.ErrorCode;
import com.image.project.exception.BusinessException;
import com.image.project.mapper.VerificationcodeMapper;
import com.image.project.model.entity.Verificationcode;
import com.image.project.service.VerificationcodeService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

/**
 * @author 86187
 * @description 针对表【VerificationCode(验证码)】的数据库操作Service实现
 * @createDate 2024-07-04 16:43:33
 */
@Service
public class VerificationcodeServiceImpl extends ServiceImpl<VerificationcodeMapper, Verificationcode>
        implements VerificationcodeService {
}




