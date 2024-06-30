import {
  deleteQuestionUsingPost,
  listQuestionByPageUsingPost,
} from '@/services/imagedada-backend/questionController';
import { Button, Card, List, Tag, message } from 'antd';
import Search from 'antd/es/input/Search';
import React, { useEffect, useState } from 'react';

const Question: React.FC = () => {
  const [questionList, setQuestionList] = useState<API.Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };
  const [searchParams, setSearchParams] = useState<API.QuestionQueryRequest>({
    ...initSearchParams,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listQuestionByPageUsingPost({
        ...searchParams,
      });
      console.log(res.data?.records);
      setQuestionList(res.data?.records ?? []);
      setTotal(res.data?.total ?? 0);
      setLoading(false);
    } catch (e: any) {
      message.error('查询失败,' + e.message);
    }
  };

  const handleRemove = async (id: number) => {
    setLoading(true);
    try {
      await deleteQuestionUsingPost({
        id: id,
      });
      message.success('删除成功');
      setLoading(false);
      await loadData();
    } catch (e: any) {
      message.error('删除失败,' + e.message);
    }
  };

  useEffect(() => {
    loadData().then();
  }, [searchParams]);

  return (
    <div className="Question">
      <div style={{ padding: '0 24px' }}>
        <Search
          placeholder="请输入应用ID"
          enterButton
          loading={loading}
          onSearch={(value) => {
            if (value !== '') {
              setSearchParams({ ...initSearchParams, appId: Number(value) });
            } else {
              setSearchParams({ ...initSearchParams });
            }
          }}
        />
      </div>
      <div className="margin-16" />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({ ...searchParams, current: page, pageSize });
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={questionList}
        footer={
          <div style={{ padding: '0 24px' }}>
            <b>QUESTION YOU KNOW LOVE</b>
          </div>
        }
        renderItem={(item) => {
          return (
            <List.Item key={item.id}>
              <Card title={<Tag color="#2db7f5">{'应用ID： ' + item.appId}</Tag>}>
                <List
                  footer={
                    <Button
                      type="primary"
                      onClick={() => {
                        handleRemove(item.id ?? 0).then();
                      }}
                    >
                      删除
                    </Button>
                  }
                  dataSource={JSON.parse(item.questionContent ?? '')}
                  renderItem={(question: any) => (
                    <List.Item key={question.title}>
                      {question.title +
                        ' ' +
                        question.options.map(
                          (option: any) => option.key + ' : ' + option.value + ' ',
                        )}
                    </List.Item>
                  )}
                />
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default Question;
