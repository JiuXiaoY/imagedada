import { getAppVoByIdUsingGet } from '@/services/imagedada-backend/appController';
import { listQuestionVoByPageUsingPost } from '@/services/imagedada-backend/questionController';
import {
  addUserAnswerUsingPost,
  generateIdUsingGet,
} from '@/services/imagedada-backend/userAnswerController';
import { history } from '@umijs/max';
import { Button, Card, Radio, RadioChangeEvent, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const App: React.FC = () => {
  const [questionContent, setQuestionContent] = useState<API.QuestionContentDTO[]>([]);
  const params = useParams();
  const [oldQuestion, setOldQuestion] = useState<API.QuestionVO>();
  const [appInfo, setAppInfo] = useState<API.AppVO>();
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [snowflakeNextId, setSnowflakeNextId] = useState<number>(0);

  const loadSnowflakeNextId = async () => {
    try {
      const res = await generateIdUsingGet();
      if (res.data) {
        setSnowflakeNextId(res.data);
      }
    } catch (error: any) {
      message.error('获取雪花ID错误');
    }
  };

  const loadQuestionData = async () => {
    setCardLoading(true);
    if (!params.id) {
      return;
    }
    try {
      const res = await listQuestionVoByPageUsingPost({
        appId: Number(params.id),
        current: 1,
        pageSize: 1,
        sortField: 'createTime',
        sortOrder: 'descend',
      });
      // 设置旧题目
      setOldQuestion(res.data?.records?.[0]);
      const questionContent = res.data?.records?.[0]?.questionContent;
      if (questionContent) {
        setQuestionContent(questionContent);
      }
      setCardLoading(false);
    } catch (error: any) {
      message.error('应用还未设置题目');
    }
  };

  const loadAppData = async () => {
    if (!params.id) {
      return;
    }
    try {
      const res = await getAppVoByIdUsingGet({
        id: Number(params.id),
      });
      if (res.data) {
        setAppInfo(res.data);
      }
    } catch (error: any) {
      message.error('获取App信息错误');
    }
  };

  useEffect(() => {
    loadSnowflakeNextId().then();
    loadQuestionData().then();
    loadAppData().then();
  }, []);

  const onChange = (e: RadioChangeEvent, index: any) => {
    const value = e.target.value;
    setSelectedAnswers((prevSelected) => {
      const updatedAnswers = [...prevSelected];
      updatedAnswers[index] = value;
      return updatedAnswers;
    });
  };

  const onSubmit = async () => {
    setLoading(true);
    if (!params.id) {
      return;
    }
    try {
      const res = await addUserAnswerUsingPost({
        appId: Number(params.id),
        choices: selectedAnswers,
        id: snowflakeNextId,
      });
      if (res.data) {
        message.success('提交成功,3秒后跳转结果页');
        setTimeout(() => {
          history.push(`/doAnswer/doAnswerResult/${res.data ?? 0}`);
        }, 3000);
      }
      setLoading(false);
    } catch (error: any) {
      message.error('提交答案错误' + error.message);
      setLoading(false);
    }
  };

  return (
    <Card
      loading={cardLoading}
      title={appInfo?.appName}
      style={{ minWidth: 1000, margin: '0 auto' }}
    >
      {questionContent.map((question, index) => (
        <div key={index} style={{ marginBottom: 20 }}>
          <h3>{question.title}</h3>
          <Radio.Group onChange={(e) => onChange(e, index)}>
            {question.options?.map((option, subOpt) => (
              <Radio key={subOpt} value={option.key}>
                {`${option.key}` + ' ' + `${option.value}`}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      ))}
      <Button loading={loading} type="primary" onClick={onSubmit}>
        提交答案
      </Button>
    </Card>
  );
};

export default App;
