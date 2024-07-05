package com.image.project.manager;

import cn.hutool.core.util.RandomUtil;
import com.aliyun.sdk.service.dysmsapi20170525.AsyncClient;
import com.aliyun.sdk.service.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.sdk.service.dysmsapi20170525.models.SendSmsResponse;
import com.google.gson.Gson;
import com.image.project.constant.AliyunSmsConstant;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

/**
 * 阿里云短信服务
 *
 * @author JXY
 * @version 1.0
 * @since 2024/7/4
 */

@Component
public class DysmsManager {

    @Resource
    private AsyncClient client;

    public void sendSms(String phoneNumber, String code) throws ExecutionException, InterruptedException {
        // 1. 创建请求
        SendSmsRequest sendSmsRequest = SendSmsRequest.builder()
                .signName(AliyunSmsConstant.TEXT_SIGNNAME)
                .templateCode(AliyunSmsConstant.TEXT_CODE)
                .phoneNumbers(phoneNumber)
                .templateParam("{\"code\":\"" + code + "\"}")
                .build();

        // 异步获取 API 请求的返回值
        CompletableFuture<SendSmsResponse> response = client.sendSms(sendSmsRequest);

        // 同步获取 API 请求的返回值
        SendSmsResponse resp = response.get();
        System.out.println(new Gson().toJson(resp));

        // 最后，关闭客户端
        client.close();
    }
}
