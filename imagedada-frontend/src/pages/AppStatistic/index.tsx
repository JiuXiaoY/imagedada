import {
  getAppAnswerCountUsingGet,
  getAppAnswerResultCountUsingGet,
} from '@/services/imagedada-backend/appStatisticController';
import { Card, Col, Row, message } from 'antd';
import Search from 'antd/es/input/Search';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

const AppStatistic: React.FC = () => {
  const [appAnswerCountList, setAppAnswerCountList] = useState<API.AppAnswerCountDTO[]>([]);
  const [appAnswerResultCountList, setAppAnswerResultCountList] = useState<
    API.AppAnswerResultCountDTO[]
  >([]);
  const [searchValue, setSearchValue] = useState<number>(9999);
  const [first, setFirst] = useState(true);

  const loadAppAnswerCount = async () => {
    try {
      const res = await getAppAnswerCountUsingGet();
      if (res.data) {
        setAppAnswerCountList(res.data);
      }
    } catch (e: any) {
      message.error('获取数据失败' + e.message);
    }
  };

  const loadAppAnswerResultCount = async () => {
    try {
      const res = await getAppAnswerResultCountUsingGet({
        appId: searchValue,
      });
      if (res.data && res.data.length > 0) {
        setAppAnswerResultCountList(res.data);
      } else {
        if (!first) {
          message.error('应用ID不存在');
        }
      }
    } catch (e: any) {
      // ignore
    }
  };

  useEffect(() => {
    loadAppAnswerCount().then();
  }, []);

  useEffect(() => {
    loadAppAnswerResultCount().then();
  }, [searchValue]);

  const appIds = appAnswerCountList.map((item) => item.appId);
  const answerCounts = appAnswerCountList.map((item) => item.answerCount);

  const options = {
    xAxis: {
      type: 'category',
      data: appIds,
      name: 'App ID',
    },
    yAxis: {
      type: 'value',
      name: 'Answer Count',
    },
    series: [
      {
        data: answerCounts,
        type: 'bar',
        smooth: true,
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
  };

  const pieData = appAnswerResultCountList.map((item) => ({
    name: item.resultName,
    value: item.resultCount,
  }));

  const ResultOptions = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '结果',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {c} ({d}%)',
        },
      },
    ],
  };

  return (
    <>
      <Search
        style={{ marginBottom: 16 }}
        placeholder="请输入应用ID"
        enterButton
        onSearch={(value) => {
          if (value !== '') {
            setSearchValue(Number.parseInt(value));
            setFirst(false);
          }
        }}
      />
      <Row gutter={16}>
        <Col span={12}>
          <Card title="热门应用">
            <ReactECharts option={options} style={{ height: 400, width: '100%' }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="应用统计">
            <ReactECharts option={ResultOptions} style={{ height: 400, width: '100%' }} />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AppStatistic;
