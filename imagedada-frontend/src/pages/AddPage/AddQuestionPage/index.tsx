import {
  addQuestionUsingPost,
  aiGenerateQuestionUsingPost,
  editQuestionUsingPost,
  listQuestionVoByPageUsingPost,
} from '@/services/imagedada-backend/questionController';
import { history } from '@@/core/history';
import { CloseOutlined } from '@ant-design/icons';
import {Button, Card, Col, Drawer, Form, Input, InputNumber, message, Progress, Row, Space} from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const App: React.FC = () => {
  const [form] = Form.useForm();
  const params = useParams();
  const [questionContent, setQuestionContent] = useState<API.QuestionContentDTO[]>([]);
  const [oldQuestion, setOldQuestion] = useState<API.QuestionVO>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [SSELoading, setSSELoading] = useState(false);
  const [realTime, setRealTime] = useState(false);
  const [present,setPresent] = useState(0)
  const [presentLoading, setPresentLoading] = useState(false)

  const loadData = async () => {
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
        form.setFieldsValue({ questions: questionContent });
        setQuestionContent(questionContent);
      }
    } catch (error: any) {
      message.error('应用还未设置题目');
    }
  };

  const onFinish = async (values: any) => {
    if (!params.id || !questionContent) {
      return;
    }
    let res: any;
    // 如果是修改
    if (oldQuestion?.id) {
      res = await editQuestionUsingPost({
        id: oldQuestion.id,
        questionContent: values.questions,
      });
    } else {
      // 创建
      res = await addQuestionUsingPost({
        appId: Number(params.id),
        questionContent: values.questions,
      });
    }
    if (res.data) {
      message.success('操作成功，即将跳转到应用详情页');
      setTimeout(() => {
        history.push(`/index/detail/${params.id ?? res.data}`);
      }, 3000);
    } else {
      message.error('操作失败，' + res.data.message);
    }
  };

  useEffect(() => {
    loadData().then();
  }, [params.id]);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const aiGenerateSubmit = async (values: any) => {
    if (!params.id) {
      return;
    }
    setLoading(true);
    onClose();
    try {
      const res = await aiGenerateQuestionUsingPost({
        appId: Number(params.id),
        questionNum: values.questionNum,
        optionNum: values.optionNum,
      });
      if (res.data) {
        message.success('AI 生成题目成功');
        const newQuestions = res.data;
        const updatedQuestionContent = [...questionContent, ...newQuestions];
        setQuestionContent(updatedQuestionContent);
        form.setFieldsValue({ questions: updatedQuestionContent });
      }
    } catch (error: any) {
      message.error('AI 生成题目失败，' + error.data?.message);
    }
    setLoading(false);
  };

  const aiGenerateSubmitSSE = async (values: any) => {
    setSSELoading(true);
    setPresentLoading(true);
    if (!params.id) {
      return;
    }
    onClose();
    try {
      // 手动填写后端完整地址
      const eventSource = new EventSource(
        `http://localhost:8400/api/question/ai_generate/sse?appId=${params.id}&questionNum=${values.questionNum}&optionNum=${values.optionNum}`,
      );
      // 监听
      eventSource.onopen = () => {
        console.log('sse 连接成功');
      };
      eventSource.onmessage = (e) => {
        if (e.data) {
          console.log(e.data);
          const newQuestions = JSON.parse(e.data);
          // 使用函数式更新状态
          setQuestionContent((prevQuestionContent) => {
            const updatedQuestionContent = [...prevQuestionContent, newQuestions];
            form.setFieldsValue({ questions: updatedQuestionContent });
            return updatedQuestionContent;
          });

          setPresent((prevPresent) => {
            return prevPresent + 100/values.questionNum;
          });
        }
      };
      eventSource.onerror = (event) => {
        if (event.eventPhase === EventSource.CLOSED) {
          eventSource.close();
          console.log('sse 连接正常关闭');
          setSSELoading(false);
          setRealTime(false);
          setPresentLoading(false);
        }
      };
    } catch (error: any) {
      message.error('AI 生成题目失败，' + error.data?.message);
    }
  };

  useEffect(() => {
    console.log(questionContent);
  }, [questionContent]);

  return (
    <>
      <Card
        title={'应用ID: ' + params.id}
        extra={
          <Row gutter={16}>
            <Col>
              <Button
                loading={SSELoading}
                type="dashed"
                onClick={() => {
                  setRealTime(true);
                  showDrawer();
                }}
                block
              >
                AI 实时生成题目
              </Button>
            </Col>
            <Col>
              <Button
                loading={loading}
                type="dashed"
                onClick={() => {
                  setRealTime(false);
                  showDrawer();
                }}
                block
              >
                AI 生成题目
              </Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => form.submit()} block>
                提交
              </Button>
            </Col>
          </Row>
        }
      >
        <Form
          wrapperCol={{ span: 24 }}
          form={form}
          name="questionContent"
          autoComplete="off"
          onFinish={onFinish}
        >
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 16 }}>
                {
                  presentLoading &&
                  <Progress percent={present} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />
                }
                <Button type="dashed" onClick={() => add({}, 0)} block>
                  在头部添加题目
                </Button>
                {fields.map((field) => (
                  <Card
                    size="small"
                    title={`题目 ${field.name + 1}`}
                    key={field.key}
                    style={{ width: 'calc(33.3333% - 11px)' }} // 三列布局
                    extra={
                      <CloseOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    }
                  >
                    <Form.Item label="题目" name={[field.name, 'title']}>
                      <Input />
                    </Form.Item>

                    <Form.Item label="选项">
                      <Form.List name={[field.name, 'options']}>
                        {(subFields, subOpt) => (
                          <div style={{ display: 'flex', flexDirection: 'column', rowGap: 12 }}>
                            {subFields.map((subField) => (
                              <Space key={subField.key}>
                                <Form.Item noStyle name={[subField.name, 'key']}>
                                  <Input placeholder="选项key" />
                                </Form.Item>
                                <Form.Item noStyle name={[subField.name, 'value']}>
                                  <Input placeholder="选项value" />
                                </Form.Item>
                                <Form.Item noStyle name={[subField.name, 'result']}>
                                  <Input placeholder="影响值" />
                                </Form.Item>
                                <CloseOutlined
                                  onClick={() => {
                                    subOpt.remove(subField.name);
                                  }}
                                />
                              </Space>
                            ))}
                            <Button type="dashed" onClick={() => subOpt.add()} block>
                              添加选项
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Form.Item>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  在尾部添加题目
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Card>
      <Drawer title="AI 生成题目" onClose={onClose} open={open}>
        <Form onFinish={realTime ? aiGenerateSubmitSSE : aiGenerateSubmit}>
          <Form.Item
            label="题目数量"
            name="questionNum"
            rules={[{ required: true, message: '请输入题目数量' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={20} placeholder="请输入题目数量" />
          </Form.Item>
          <Form.Item
            label="选项数量"
            name="optionNum"
            rules={[{ required: true, message: '请输入选项数量' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={20} placeholder="请输入选项数量" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default App;
