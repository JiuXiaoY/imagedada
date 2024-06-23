package com.image.project.scoring;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.image.project.model.dto.question.QuestionContentDTO;
import com.image.project.model.entity.App;
import com.image.project.model.entity.Question;
import com.image.project.model.entity.ScoringResult;
import com.image.project.model.entity.UserAnswer;
import com.image.project.model.vo.QuestionVO;
import com.image.project.service.QuestionService;
import com.image.project.service.ScoringResultService;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 自定义测评类
 *
 * @author JXY
 * @version 1.0
 * @since 2024/6/23
 */
@ScoringStrategyConfig(appType = 1, scoringStrategy = 0)
public class CustomTestScoringStrategy implements ScoringStrategy {

    @Resource
    private QuestionService questionService;

    @Resource
    private ScoringResultService scoringResultService;

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
        Question question = questionService.getOne(
                Wrappers.lambdaQuery(Question.class).eq(Question::getAppId, appId)
        );

        // 获取答案列表
        List<ScoringResult> resultList = scoringResultService.list(
                Wrappers.lambdaQuery(ScoringResult.class).eq(ScoringResult::getAppId, appId)
        );

        // choices 便是用户的选择答案,先统计出每个选项的个数
        Map<String, Integer> optionCount = new HashMap<>();

        // 这个 question 是一个 Json 对象，先转化为 java 对象
        QuestionVO questionVO = QuestionVO.objToVo(question);
        List<QuestionContentDTO> questionContentDTOList = questionVO.getQuestionContent();

        // 取题目
        for (QuestionContentDTO questionContentDTO : questionContentDTOList) {
            // 取用户选择的答案
            for (String choice : choices) {
                // 取当前题目答案
                for (QuestionContentDTO.Option option : questionContentDTO.getOptions()) {
                    // 将用户答案和当前题目答案一一比较
                    // 一致则加分
                    if (choice.equals(option.getKey())) {
                        optionCount.put(option.getResult(), optionCount.getOrDefault(option.getResult(), 0) + 1);
                    }
                }
            }
        }

        // 遍历每种评分结果，得出结论
        int maxScore = 0;
        ScoringResult maxScoringResult = resultList.get(0);

        for (ScoringResult result : resultList) {
            List<String> resultProp = JSONUtil.toList(result.getResultProp(), String.class);
            int currentScore = resultProp.stream()
                    .mapToInt(prop -> optionCount.getOrDefault(prop, 0))
                    .sum();

            if (currentScore > maxScore) {
                maxScore = currentScore;
                maxScoringResult = result;
            }
        }

        // 4. 构造返回值，填充答案对象的属性
        UserAnswer userAnswer = new UserAnswer();
        userAnswer.setAppId(appId);
        userAnswer.setAppType(app.getAppType());
        userAnswer.setScoringStrategy(app.getScoringStrategy());
        userAnswer.setChoices(JSONUtil.toJsonStr(choices));
        userAnswer.setResultId(maxScoringResult.getId());
        userAnswer.setResultName(maxScoringResult.getResultName());
        userAnswer.setResultDesc(maxScoringResult.getResultDesc());
        userAnswer.setResultPicture(maxScoringResult.getResultPicture());
        return userAnswer;
    }
}
