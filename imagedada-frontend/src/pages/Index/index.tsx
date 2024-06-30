import { listAppVoByPageUsingPost } from '@/services/imagedada-backend/appController';
import { Avatar, Button, Card, Image, List, message } from 'antd';
import Meta from 'antd/es/card/Meta';
import Search from 'antd/es/input/Search';
import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [dataList, setDataList] = useState<API.AppVO[]>([]);
  const initSearchParams = {
    current: 1,
    pageSize: 8,
    sortField: 'createTime',
    sortOrder: 'desc',
  };
  const [searchParams, setSearchParams] = useState<API.AppQueryRequest>({
    ...initSearchParams,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await listAppVoByPageUsingPost({
        ...searchParams,
      });
      console.log(res);
      setDataList(res.data?.records ?? []);
      setTotal(res.data?.total ?? 0);
      setLoading(false);
    } catch (e: any) {
      message.error('获取数据失败' + e.message);
    }
  };

  useEffect(() => {
    loadData().then();
  }, [searchParams]);

  return (
    <div className="indexPage">
      <div style={{ padding: '0 24px' }}>
        <Search
          placeholder="请输入应用ID"
          enterButton
          loading={loading}
          onSearch={(value) => {
            if (value !== '') {
              setSearchParams({ ...initSearchParams, appName: value });
            } else {
              setSearchParams({ ...initSearchParams });
            }
          }}
        />
        <div className="margin-16" />
        <List
          grid={{
            gutter: 16,
            xs: 2,
            sm: 2,
            md: 2,
            lg: 2,
            xl: 2,
            xxl: 4,
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
          dataSource={dataList}
          footer={
            <div style={{ padding: '0 24px' }}>
              <b>QUESTION YOU KNOW LOVE</b>
            </div>
          }
          renderItem={(item) => {
            const apiLink = `/index/detail/${item.id}`;
            return (
              <List.Item key={item.appName} style={{ padding: 0 }}>
                <Card
                  cover={<Image alt="example" src="http://bt.imagegem.cn/dzq.jpg" />}
                  actions={[
                    <Button key={item.id} type="primary" style={{ width: 300 }} href={apiLink}>
                      前往查看
                    </Button>,
                  ]}
                >
                  <Meta
                    avatar={<Avatar src="http://bt.imagegem.cn/favicon.png" />}
                    title={item.appName}
                    description={item.appDesc}
                  />
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default App;
