import { getUserAnswerVoByIdUsingGet } from '@/services/imagedada-backend/userAnswerController';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { Button, Card, Col, Flex, Image, Rate, Row, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const [userAnswer, setUserAnswer] = useState<API.UserAnswerVO>();

  const customIcons: Record<number, React.ReactNode> = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getUserAnswerVoByIdUsingGet({
        id: Number(params.id),
      });
      setUserAnswer(res.data);
      setLoading(false);
    } catch (error: any) {
      message.error('获取数据失败' + error.message);
    }
  };

  useEffect(() => {
    loadData().then();
  }, []);

  return (
    <Card loading={loading}>
      <Row>
        <Col span={12} style={{ textAlign: 'center' }}>
          <Image
            src={require('../../Assets/6ea0c485409d7a847be5eae7a3c35cb.jpg')}
            alt="Description of the image"
            preview={false}
            style={{ width: 712, height: 512 }}
          />
        </Col>
        <Col
          span={12}
          style={{
            textAlign: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Row style={{ width: '100%', justifyContent: 'center', marginTop: 100 }}>
            <Card
              style={{
                width: 400,
                height: 200,
                display: 'flex',
                alignItems: 'center', // 添加这一行
                justifyContent: 'center', // 添加这一行以确保水平居中
              }}
            >
              <div style={{ fontSize: '32px' }}>{userAnswer?.appType === 0 ? userAnswer.resultScore : userAnswer?.resultName}</div>
            </Card>
          </Row>
          <Row style={{ width: '100%', justifyContent: 'center' }}>
            <ProCard
              style={{
                width: 400,
                height: 50,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              boxShadow
            >
              <Flex gap="middle" vertical>
                <Rate
                  defaultValue={6}
                  character={({ index = 0 }) => customIcons[index + 1]}
                  disabled
                />
              </Flex>
            </ProCard>
          </Row>
          <Row style={{ width: '100%', justifyContent: 'center', marginBottom: 50 }}>
            <Button type="primary" style={{ marginRight: '16px', width: 192 }} href={'/'}>
              返回主页
            </Button>
            <Button type="primary" style={{ width: 192 }} href={`/index/detail/${userAnswer?.appId}`}>
              再测一遍
            </Button>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default App;
