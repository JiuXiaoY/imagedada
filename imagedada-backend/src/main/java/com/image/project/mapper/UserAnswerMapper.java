package com.image.project.mapper;

import com.image.project.model.dto.appanswer.AppAnswerCountDTO;
import com.image.project.model.dto.appanswer.AppAnswerResultCountDTO;
import com.image.project.model.entity.UserAnswer;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author 86187
 * @description 针对表【user_answer(用户答题记录)】的数据库操作Mapper
 * @createDate 2024-06-21 16:00:08
 * @Entity com.image.project.model.entity.UserAnswer
 */
public interface UserAnswerMapper extends BaseMapper<UserAnswer> {

    @Select("select appId, count(userId) as answerCount from user_answer\n" +
            "    group by appId order by answerCount desc limit 10;")
    List<AppAnswerCountDTO> doAppAnswerCount();


    @Select("select resultName, count(resultName) as resultCount from user_answer\n" +
            "    where appId = #{appId}\n" +
            "    group by resultName order by resultCount desc;")
    List<AppAnswerResultCountDTO> doAppAnswerResultCount(Long appId);
}




