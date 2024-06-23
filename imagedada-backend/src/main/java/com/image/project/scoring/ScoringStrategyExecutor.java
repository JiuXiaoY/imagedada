package com.image.project.scoring;

import com.image.project.common.ErrorCode;
import com.image.project.exception.BusinessException;
import com.image.project.model.entity.App;
import com.image.project.model.entity.UserAnswer;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

/**
 * 评分策略执行器
 *
 * @author JXY
 * @version 1.0
 * @since 2024/6/23
 */
@Component
public class ScoringStrategyExecutor {

    @Resource
    private List<ScoringStrategy> scoringStrategyList;

    public UserAnswer doScore(List<String> choices, App app) {
        Integer appType = app.getAppType();
        Integer scoringStrategy = app.getScoringStrategy();
        if (appType == null || scoringStrategy == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "appType or scoringStrategy is null");
        }

        // 根据注解获取策略
        // 我们拿到所有的策略，（这里只有两个CustomScoreScoringStrategy.java，CustomTestScoringStrategy.java）
        // 然后判断他们头上得注解
        // 然后判断注解里面的appType和scoringStrategy是否和app的appType和scoringStrategy相等
        // 如果相等，就返回这个策略得doScore方法
        for (ScoringStrategy strategy : scoringStrategyList) {
            if (strategy.getClass().isAnnotationPresent(ScoringStrategyConfig.class)) {
                ScoringStrategyConfig annotation = strategy.getClass().getAnnotation(ScoringStrategyConfig.class);
                if (annotation.appType() == appType && annotation.scoringStrategy() == scoringStrategy) {
                    return strategy.doScore(choices, app);
                }
            }
        }
        throw new BusinessException(ErrorCode.SYSTEM_ERROR, "应用配置有误，未找到匹配的策略");
    }
}
