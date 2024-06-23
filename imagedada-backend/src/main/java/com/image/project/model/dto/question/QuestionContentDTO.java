package com.image.project.model.dto.question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author JXY
 * @version 1.0
 * @since 2024/6/22
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionContentDTO {
    /**
     * 题目标题
     */
    private String title;

    /**
     * 题目选项列表
     */
    private List<Option> options;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Option {
        /**
         * 关联的结果
         */
        private String result;

        private int score;

        private String value;

        private String key;

    }
}
