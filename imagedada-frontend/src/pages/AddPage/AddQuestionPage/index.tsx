import {
  addQuestionUsingPost,
  editQuestionUsingPost,
  listQuestionVoByPageUsingPost,
} from '@/services/imagedada-backend/questionController';
import { history } from '@@/core/history';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const App: React.FC = () => {
  const [form] = Form.useForm();
  const params = useParams();
  const [questionContent, setQuestionContent] = useState<API.QuestionContentDTO[]>([]);
  const [oldQuestion, setOldQuestion] = useState<API.QuestionVO>();

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

  return (
    <Card
      title={'应用ID: ' + params.id}
      extra={
        <Button type="primary" onClick={() => form.submit()} block>
          提交
        </Button>
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
  );
};

export default App;
