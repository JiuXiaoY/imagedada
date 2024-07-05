import ShareModal from '@/pages/CommonComponents/ShareModal';
import { getAppVoByIdUsingGet } from '@/services/imagedada-backend/appController';
import { useModel, useParams } from '@@/exports';
import { Avatar, Button, Card, Divider, List, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<API.AppVO>();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  // 获取用户全局信息
  const { initialState, setInitialState } = useModel('@@initialState');

  const loginUser = initialState?.loginUser;
  const loadData = async () => {
    if (!params.id) {
      message.error('参数不存在');
      return;
    }
    setLoading(true);
    try {
      const res = await getAppVoByIdUsingGet({
        id: Number(params.id),
      });
      setData(res.data);
    } catch (error: any) {
      message.error('请求失败' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData().then();
  }, []);

  const onCancel = () => {
    setShareModalVisible(false);
  };

  const onOpen = () => {
    setShareModalVisible(true);
  };

  return (
    <div className="detailPage" style={{ display: 'flex', margin: '0 auto' }}>
      <Card loading={loading} style={{ width: 1400 }}>
        {data ? (
          <>
            <List itemLayout="vertical">
              <List.Item
                key={params.id}
                actions={[]}
                extra={
                  <img
                    width={800}
                    alt="logo"
                    src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                  />
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={data?.appIcon} size="large" />}
                  title={<h2>{data?.appName}</h2>}
                  description={<h3>{data?.appDesc}</h3>}
                />
                <h2>应用类型: {data?.appType === 0 ? '得分类' : '测评类'}</h2>
                <h2>评分策略: {data?.scoringStrategy === 0 ? '自定义' : 'AI'}</h2>
                <h2>作者: {data?.user?.userName}</h2>
                <h2>创建时间: {moment(data?.createTime).format('YYYY-MM-DD HH:mm:ss')}</h2>
                <div style={{ position: 'absolute', bottom: 16 }}>
                  <Button type="primary" href={`/doAnswer/${data?.id}`}>
                    开始答题
                  </Button>
                  <Divider type="vertical" />
                  <Button type="dashed" onClick={onOpen}>
                    分享应用
                  </Button>
                  {loginUser && loginUser?.id === data?.userId && (
                    <>
                      <Divider type="vertical" />
                      <Button type="dashed" href={`/addPage/addScoringResultPage/${data?.id}`}>
                        设置评分
                      </Button>
                      <Divider type="vertical" />
                      <Button type="dashed" href={`/addPage/addQuestionPage/${data?.id}`}>
                        设置题目
                      </Button>
                      <Divider type="vertical" />
                      <Button type="dashed" href={`/addPage/addAppPage/${data?.id}`}>
                        修改应用
                      </Button>
                    </>
                  )}
                </div>
              </List.Item>
            </List>
          </>
        ) : (
          <>数据有误</>
        )}
      </Card>
      <ShareModal visible={shareModalVisible} onCancel={onCancel} linkUrl="http://bt.imagegem.cn/favicon.png"></ShareModal>
    </div>
  );
};

export default App;
