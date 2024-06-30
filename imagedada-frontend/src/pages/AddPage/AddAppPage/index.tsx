import {
  addAppUsingPost,
  editAppUsingPost,
  getAppVoByIdUsingGet,
} from '@/services/imagedada-backend/appController';
import { useParams } from '@@/exports';
import { Button, Card, Form, Input, Select, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const [oldApp, setOldApp] = useState<API.AppVO>();
  const [form] = Form.useForm();

  const controlApp = async (values: API.AppAddRequest) => {
    try {
      setLoading(true);
      let res;
      if (params.id) {
        res = await editAppUsingPost({
          id: Number(params.id),
          ...values,
        });
      } else {
        res = await addAppUsingPost(values);
      }
      if (res.data) {
        message.success('操作成功，即将跳转到应用详情页');
        setTimeout(() => {
          history.push(`/index/detail/${params.id ?? res.data}`);
        }, 3000);
      }
      setLoading(false);
    } catch (e: any) {
      console.log('操作失败' + e.message);
    }
  };

  const loadData = async () => {
    if (!params.id) {
      return;
    }
    try {
      const res = await getAppVoByIdUsingGet({
        id: Number(params.id),
      });
      setOldApp(res.data);
      form.setFieldsValue({
        appName: res.data?.appName,
        appDesc: res.data?.appDesc,
        appIcon: res.data?.appIcon,
        appType: String(res.data?.appType),
        scoringStrategy: String(res.data?.scoringStrategy),
      }); // 设置表单初始值
    } catch (error: any) {
      message.error('请求失败' + error.message);
    }
  };

  useEffect(() => {
    loadData().then();
  }, [params.id]);

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 16 },
      sm: { span: 14 },
    },
  };

  return (
    <div className="addAppPage" style={{ display: 'flex', margin: '0 auto' }}>
      <Card style={{ width: 1400 }} title="创建应用">
        <Form
          {...formItemLayout}
          variant="filled"
          style={{ maxWidth: 600 }}
          form={form}
          onFinish={(values) => {
            controlApp(values).then();
          }}
        >
          <Form.Item
            label="应用名称"
            name="appName"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>

          <Form.Item
            label="应用描述"
            name="appDesc"
            rules={[{ required: true, message: '请输入应用描述' }]}
          >
            <Input placeholder="请输入应用描述" />
          </Form.Item>

          <Form.Item
            label="应用图标"
            name="appIcon"
            rules={[{ required: true, message: '请输入应用图标' }]}
          >
            <Input placeholder="请输入应用图标" />
          </Form.Item>

          <Form.Item
            label="应用类型"
            name="appType"
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Select
              options={[
                { value: '0', label: '得分类' },
                { value: '1', label: '测评类' },
              ]}
              defaultActiveFirstOption
            />
          </Form.Item>

          <Form.Item
            label="评分策略"
            name="scoringStrategy"
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Select
              options={[
                { value: '0', label: '自定义' },
                { value: '1', label: 'AI' },
              ]}
              defaultActiveFirstOption
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button loading={loading} type="primary" htmlType="submit">
              {params.id ? '修改应用' : '创建应用'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default App;
