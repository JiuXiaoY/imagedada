package com.image.project.scoring;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.image.project.common.ErrorCode;
import com.image.project.constant.QuestionConstant;
import com.image.project.constant.RedissonConstant;
import com.image.project.exception.BusinessException;
import com.image.project.manager.AiManager;
import com.image.project.model.dto.question.QuestionAnswerDTO;
import com.image.project.model.dto.question.QuestionContentDTO;
import com.image.project.model.entity.App;
import com.image.project.model.entity.Question;
import com.image.project.model.entity.ScoringResult;
import com.image.project.model.entity.UserAnswer;
import com.image.project.model.vo.QuestionVO;
import com.image.project.service.QuestionService;
import com.image.project.service.ScoringResultService;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 自定义测评类
 *
 * @author JXY
 * @version 1.0
 * @since 2024/6/23
 */
@ScoringStrategyConfig(appType = 1, scoringStrategy = 1)
public class AiTestScoringStrategy implements ScoringStrategy {

    @Resource
    private QuestionService questionService;

    @Resource
    private AiManager aiManager;

    @Resource
    private RedissonClient redissonClient;

    /**
     * 本地缓存
     */
    private final Cache<String, String> answerCacheMap =
            Caffeine.newBuilder()
                    .initialCapacity(1024)
                    .expireAfterAccess(5L, TimeUnit.MINUTES)
                    .build();

    /**
     * 测评
     *
     * @param choices 选择
     * @param app     应用
     * @return 用户答案
     */
    @Override
    public UserAnswer doScore(List<String> choices, App app) {
        // 获取 应用id 对应的题目列表
        Long appId = app.getId();
        String strChoices = JSONUtil.toJsonStr(choices);
        String caffeineKey = getCaffeineKey(appId, strChoices);
        String answerJson = answerCacheMap.getIfPresent(caffeineKey);

        // 先从缓存中取
        if (StrUtil.isNotBlank(answerJson)) {
            UserAnswer userAnswer = JSONUtil.toBean(answerJson, UserAnswer.class);
            userAnswer.setAppId(appId);
            userAnswer.setAppType(app.getAppType());
            userAnswer.setScoringStrategy(app.getScoringStrategy());
            userAnswer.setChoices(strChoices);
            return userAnswer;
        }

        // 定义锁
        RLock lock = redissonClient.getLock(RedissonConstant.AI_ANSWER_LOCK + caffeineKey);

        try {
            // 竞争锁
            boolean tryLock = lock.tryLock(3, 20, TimeUnit.SECONDS);
            if (!tryLock) {
                // todo 这里其实可以做一个降级服务
                return null;
            }

            Question question = questionService.getOne(
                    Wrappers.lambdaQuery(Question.class).eq(Question::getAppId, appId)
            );

            // 获取答案列表
            QuestionVO questionVO = QuestionVO.objToVo(question);
            List<QuestionContentDTO> questionContent = questionVO.getQuestionContent();

            // 2. 调用 AI 获取结果
            // 封装 Prompt
            String userMessage = getAiTestScoringUserMessage(app, questionContent, choices);
            // AI 生成
            String result = aiManager.doSyncStableRequest(QuestionConstant.QUESTION_ANSWER_PROMPT, userMessage);
            // 截取需要的 JSON 信息
            int start = result.indexOf("{");
            int end = result.lastIndexOf("}");
            String json = result.substring(start, end + 1);

            // 缓存结果
            answerCacheMap.put(caffeineKey, json);

            // 3. 构造返回值，填充答案对象的属性
            UserAnswer userAnswer = JSONUtil.toBean(json, UserAnswer.class);
            userAnswer.setAppId(appId);
            userAnswer.setAppType(app.getAppType());
            userAnswer.setScoringStrategy(app.getScoringStrategy());
            userAnswer.setChoices(strChoices);
            return userAnswer;

        } catch (InterruptedException e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "获取锁失败");
        } finally {
            if (lock != null && lock.isLocked()) {
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            }
        }
    }

    /**
     * AI 评分用户消息封装
     *
     * @param app
     * @param questionContentDTOList
     * @param choices
     * @return
     */
    private String getAiTestScoringUserMessage(App app, List<QuestionContentDTO> questionContentDTOList, List<String> choices) {
        StringBuilder userMessage = new StringBuilder();
        userMessage.append(app.getAppName()).append("\n");
        userMessage.append("【【【").append(app.getAppDesc()).append("】】】").append("\n");
        List<QuestionAnswerDTO> questionAnswerDTOList = new ArrayList<>();
        for (int i = 0; i < questionContentDTOList.size(); i++) {
            QuestionAnswerDTO questionAnswerDTO = new QuestionAnswerDTO();
            QuestionContentDTO questionContentDTO = questionContentDTOList.get(i);
            questionAnswerDTO.setTitle(questionContentDTO.getTitle());
            // 此处填入的是选项，要做出修改
            questionAnswerDTO.setUserAnswer(getOptionDesc(questionContentDTO, choices.get(i)));
            questionAnswerDTOList.add(questionAnswerDTO);
        }
        userMessage.append(JSONUtil.toJsonStr(questionAnswerDTOList));
        return userMessage.toString();
    }

    private String getOptionDesc(QuestionContentDTO questionContentDTO, String option) {
        List<QuestionContentDTO.Option> options = questionContentDTO.getOptions();
        for (QuestionContentDTO.Option temp : options) {
            if (temp.getKey().equals(option)) {
                return temp.getValue();
            }
        }
        throw new BusinessException(ErrorCode.PARAMS_ERROR, "不存在该选项");
    }

    private String getCaffeineKey(Long appId, String choices) {
        return DigestUtil.md5Hex(appId + choices);
    }
}
