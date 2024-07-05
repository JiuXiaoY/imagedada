package com.image.project.controller;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.image.project.annotation.AuthCheck;
import com.image.project.common.BaseResponse;
import com.image.project.common.DeleteRequest;
import com.image.project.common.ErrorCode;
import com.image.project.common.ResultUtils;
import com.image.project.constant.QuestionConstant;
import com.image.project.constant.UserConstant;
import com.image.project.exception.BusinessException;
import com.image.project.exception.ThrowUtils;
import com.image.project.manager.AiManager;
import com.image.project.model.dto.question.*;
import com.image.project.model.entity.App;
import com.image.project.model.entity.Question;
import com.image.project.model.entity.User;
import com.image.project.model.enums.AppTypeEnum;
import com.image.project.model.vo.QuestionVO;
import com.image.project.service.AppService;
import com.image.project.service.QuestionService;
import com.image.project.service.UserService;
import com.zhipu.oapi.service.v4.model.ModelData;
import io.reactivex.Flowable;
import io.reactivex.Scheduler;
import io.reactivex.schedulers.Schedulers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 题目接口
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://www.code-nav.cn">编程导航学习圈</a>
 */
@RestController
@RequestMapping("/question")
@Slf4j
public class QuestionController {

    @Resource
    private QuestionService questionService;

    @Resource
    private UserService userService;

    @Resource
    private AppService appService;

    @Resource
    private AiManager aiManager;

    @Resource
    private Scheduler vipScheduler;

    // region 增删改查

    /**
     * 创建题目
     *
     * @param questionAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    public BaseResponse<Long> addQuestion(@RequestBody QuestionAddRequest questionAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionAddRequest == null, ErrorCode.PARAMS_ERROR);
        // 在此处将实体类和 DTO 进行转换
        Question question = new Question();
        BeanUtils.copyProperties(questionAddRequest, question);
        // 将前端传来的DTO转换为json字符串
        List<QuestionContentDTO> questionContentDTO = questionAddRequest.getQuestionContent();
        question.setQuestionContent(JSONUtil.toJsonStr(questionContentDTO));

        // 数据校验
        questionService.validQuestion(question, true);
        // 填充默认值
        User loginUser = userService.getLoginUser(request);
        question.setUserId(loginUser.getId());
        // 写入数据库
        boolean result = questionService.save(question);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 返回新写入的数据 id
        long newQuestionId = question.getId();
        return ResultUtils.success(newQuestionId);
    }

    /**
     * 删除题目
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteQuestion(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        Question oldQuestion = questionService.getById(id);
        ThrowUtils.throwIf(oldQuestion == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldQuestion.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = questionService.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 更新题目（仅管理员可用）
     *
     * @param questionUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateQuestion(@RequestBody QuestionUpdateRequest questionUpdateRequest) {
        if (questionUpdateRequest == null || questionUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // 在此处将实体类和 DTO 进行转换
        Question question = new Question();
        BeanUtils.copyProperties(questionUpdateRequest, question);
        List<QuestionContentDTO> questionContentDTO = questionUpdateRequest.getQuestionContent();
        question.setQuestionContent(JSONUtil.toJsonStr(questionContentDTO));
        // 数据校验
        questionService.validQuestion(question, false);
        // 判断是否存在
        long id = questionUpdateRequest.getId();
        Question oldQuestion = questionService.getById(id);
        ThrowUtils.throwIf(oldQuestion == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = questionService.updateById(question);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 根据 id 获取题目（封装类）
     *
     * @param id
     * @return
     */
    @GetMapping("/get/vo")
    public BaseResponse<QuestionVO> getQuestionVOById(long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Question question = questionService.getById(id);
        ThrowUtils.throwIf(question == null, ErrorCode.NOT_FOUND_ERROR);
        // 获取封装类
        return ResultUtils.success(questionService.getQuestionVO(question, request));
    }

    /**
     * 分页获取题目列表（仅管理员可用）
     *
     * @param questionQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<Question>> listQuestionByPage(@RequestBody QuestionQueryRequest questionQueryRequest) {
        long current = questionQueryRequest.getCurrent();
        long size = questionQueryRequest.getPageSize();
        // 查询数据库
        Page<Question> questionPage = questionService.page(new Page<>(current, size),
                questionService.getQueryWrapper(questionQueryRequest));
        return ResultUtils.success(questionPage);
    }

    /**
     * 分页获取题目列表（封装类）
     *
     * @param questionQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<QuestionVO>> listQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest,
                                                               HttpServletRequest request) {
        long current = questionQueryRequest.getCurrent();
        long size = questionQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<Question> questionPage = questionService.page(new Page<>(current, size),
                questionService.getQueryWrapper(questionQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionService.getQuestionVOPage(questionPage, request));
    }

    /**
     * 分页获取当前登录用户创建的题目列表
     *
     * @param questionQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<QuestionVO>> listMyQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest,
                                                                 HttpServletRequest request) {
        ThrowUtils.throwIf(questionQueryRequest == null, ErrorCode.PARAMS_ERROR);
        // 补充查询条件，只查询当前登录用户的数据
        User loginUser = userService.getLoginUser(request);
        questionQueryRequest.setUserId(loginUser.getId());
        long current = questionQueryRequest.getCurrent();
        long size = questionQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<Question> questionPage = questionService.page(new Page<>(current, size),
                questionService.getQueryWrapper(questionQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionService.getQuestionVOPage(questionPage, request));
    }

    /**
     * 编辑题目（给用户使用）
     *
     * @param questionEditRequest
     * @param request
     * @return
     */
    @PostMapping("/edit")
    public BaseResponse<Boolean> editQuestion(@RequestBody QuestionEditRequest questionEditRequest, HttpServletRequest request) {
        if (questionEditRequest == null || questionEditRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // 在此处将实体类和 DTO 进行转换
        Question question = new Question();
        BeanUtils.copyProperties(questionEditRequest, question);
        List<QuestionContentDTO> questionContentDTO = questionEditRequest.getQuestionContent();
        question.setQuestionContent(JSONUtil.toJsonStr(questionContentDTO));
        // 数据校验
        questionService.validQuestion(question, false);
        User loginUser = userService.getLoginUser(request);
        // 判断是否存在
        long id = questionEditRequest.getId();
        Question oldQuestion = questionService.getById(id);
        ThrowUtils.throwIf(oldQuestion == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可编辑
        if (!oldQuestion.getUserId().equals(loginUser.getId()) && !userService.isAdmin(loginUser)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = questionService.updateById(question);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    // endregion

    // region AI生成功能
    private String getGenerateQuestionUserMessage(App app, int questionNum, int optionNum) {
        StringBuilder userMessage = new StringBuilder();
        userMessage.append(app.getAppName()).append("\n");
        userMessage.append("【【【").append(app.getAppDesc()).append("】】】").append("\n");
        userMessage.append(Objects.requireNonNull(AppTypeEnum.getEnumByValue(app.getAppType())).getText()).append("\n");
        userMessage.append(questionNum).append("\n");
        userMessage.append(optionNum).append("\n");
        return userMessage.toString();
    }

    @PostMapping("ai_generate")
    public BaseResponse<List<QuestionContentDTO>> aiGenerateQuestion(@RequestBody AiGenerateRequest aiGenerateRequest,
                                                                     HttpServletRequest request) {
        ThrowUtils.throwIf(aiGenerateRequest == null, ErrorCode.PARAMS_ERROR);
        // 获取参数
        Long appId = aiGenerateRequest.getAppId();
        int questionNum = aiGenerateRequest.getQuestionNum();
        int optionNum = aiGenerateRequest.getOptionNum();

        // 获取应用信息
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "app不存在");

        // 获取用户信息
        String userMessage = getGenerateQuestionUserMessage(app, questionNum, optionNum);
        // 调用AI生成题目
        String result = aiManager.doSyncRequest(QuestionConstant.QUESTION_PROMPT, userMessage, null);
        // 截取有效内容
        int startIndex = result.indexOf("[");
        int endIndex = result.lastIndexOf("]");
        if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
            result = result.substring(startIndex, endIndex + 1);
        } else {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI生成题目失败");
        }
        List<QuestionContentDTO> questionContentDTOS = JSONUtil.toList(result, QuestionContentDTO.class);
        return ResultUtils.success(questionContentDTOS);
    }


    // endregion

    // region SSE

    @GetMapping("/ai_generate/sse")
    public SseEmitter aiGenerateQuestionSSE(AiGenerateRequest aiGenerateRequest,
                                            HttpServletRequest request) {
        ThrowUtils.throwIf(aiGenerateRequest == null, ErrorCode.PARAMS_ERROR);
        // 获取参数
        Long appId = aiGenerateRequest.getAppId();
        int questionNum = aiGenerateRequest.getQuestionNum();
        int optionNum = aiGenerateRequest.getOptionNum();

        // 获取应用信息
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "app不存在");
        // 获取用户信息
        String userMessage = getGenerateQuestionUserMessage(app, questionNum, optionNum);

        // 建立SSE连接对象
        SseEmitter sseEmitter = new SseEmitter(0L);

        // 调用AI生成题目
        Flowable<ModelData> flowable = aiManager.doStreamRequest(QuestionConstant.QUESTION_PROMPT, userMessage, null);
        // 定义一个计数器,原子型
        AtomicInteger count = new AtomicInteger(0);
        StringBuilder SingleQuestion = new StringBuilder();
        flowable
                .observeOn(Schedulers.io())
                .map(modelData -> modelData.getChoices().get(0).getDelta().getContent())
                .map(content -> content.replaceAll("\\s", ""))
                .filter(StrUtil::isNotBlank)
                .flatMap(content -> {
                    List<Character> characters = new ArrayList<>();
                    for (char c : content.toCharArray()) {
                        characters.add(c);
                    }
                    return Flowable.fromIterable(characters);
                })
                .doOnNext(c -> {
                    if (c.equals('{')) {
                        count.addAndGet(1);
                    }

                    if (count.get() > 0) {
                        SingleQuestion.append(c);
                    }

                    if (c.equals('}')) {
                        count.addAndGet(-1);
                        if (count.get() == 0) {
                            sseEmitter.send(JSONUtil.toJsonStr(SingleQuestion.toString()));
                            SingleQuestion.setLength(0);
                        }
                    }

                })
                .doOnError((e) -> {
                    log.error("SSE异常", e);
                })
                .doOnComplete(sseEmitter::complete)
                .subscribe();

        return sseEmitter;
    }

    @GetMapping("/ai_generate/sse/test")
    public SseEmitter aiGenerateQuestionSSEVip(AiGenerateRequest aiGenerateRequest,
                                               HttpServletRequest request) {
        ThrowUtils.throwIf(aiGenerateRequest == null, ErrorCode.PARAMS_ERROR);
        // 获取参数
        Long appId = aiGenerateRequest.getAppId();
        int questionNum = aiGenerateRequest.getQuestionNum();
        int optionNum = aiGenerateRequest.getOptionNum();

        // 获取应用信息
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "app不存在");
        // 获取用户信息
        String userMessage = getGenerateQuestionUserMessage(app, questionNum, optionNum);

        // 建立SSE连接对象
        SseEmitter sseEmitter = new SseEmitter(0L);

        // 调用AI生成题目
        Flowable<ModelData> flowable = aiManager.doStreamRequest(QuestionConstant.QUESTION_PROMPT, userMessage, null);
        // 定义一个计数器,原子型
        AtomicInteger count = new AtomicInteger(0);
        StringBuilder SingleQuestion = new StringBuilder();
        // 可以是single或者io
        Scheduler io = Schedulers.single();
        // 如果是vip，用自定义的线程池
        User user = userService.getLoginUser(request);
        if (user.getUserRole().equals(UserConstant.VIP_ROLE)) {
            io = vipScheduler;
        }

        flowable
                .observeOn(io)
                .map(modelData -> modelData.getChoices().get(0).getDelta().getContent())
                .map(content -> content.replaceAll("\\s", ""))
                .filter(StrUtil::isNotBlank)
                .flatMap(content -> {
                    List<Character> characters = new ArrayList<>();
                    for (char c : content.toCharArray()) {
                        characters.add(c);
                    }
                    return Flowable.fromIterable(characters);
                })
                .doOnNext(c -> {
                    if (c.equals('{')) {
                        count.addAndGet(1);
                    }

                    if (count.get() > 0) {
                        SingleQuestion.append(c);
                    }

                    if (c.equals('}')) {
                        count.addAndGet(-1);
                        if (count.get() == 0) {
                            sseEmitter.send(JSONUtil.toJsonStr(SingleQuestion.toString()));
                            SingleQuestion.setLength(0);
                        }
                    }

                })
                .doOnError((e) -> {
                    log.error("SSE异常", e);
                })
                .doOnComplete(sseEmitter::complete)
                .subscribe();

        return sseEmitter;
    }

    // endregion
}
