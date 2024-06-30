import {
  deleteUserAnswerUsingPost, listMyUserAnswerVoByPageUsingPost,
  listUserAnswerByPageUsingPost,
} from '@/services/imagedada-backend/userAnswerController';
import { useModel } from '@@/exports';
import { EllipsisOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Dropdown, message } from 'antd';
import { useRef, useState } from 'react';

export default () => {
  const [selectedRowsState, setSelectedRows] = useState<API.UserAnswerVO[]>([]);
  const actionRef = useRef<ActionType>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const loginUser = initialState?.loginUser;

  const handleRemove = async (record: API.UserAnswerVO) => {
    const hide = message.loading('正在删除');
    if (!record) return true;
    try {
      await deleteUserAnswerUsingPost({
        id: record.id,
      });
      hide();
      message.success('删除成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  const columns: ProColumns<API.UserAnswerVO>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'index',
    },
    {
      title: 'APPID',
      dataIndex: 'appId',
      valueType: 'text',
      hideInForm: true,
    },
    {
      title: '应用类型',
      dataIndex: 'appType',
      hideInForm: true,
      valueEnum: {
        0: {
          text: '得分类',
        },
        1: {
          text: '测评类',
        },
      },
    },
    {
      title: '用户选择',
      dataIndex: 'choices',
      valueType: 'text',
    },
    {
      title: '结果名称',
      dataIndex: 'resultName',
      valueType: 'text',
    },
    {
      title: '结果描述',
      dataIndex: 'resultDesc',
      valueType: 'text',
    },
    {
      title: '结果图标',
      dataIndex: 'resultPicture',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '得分',
      dataIndex: 'resultScore',
      valueType: 'text',
    },
    {
      title: '得分策略',
      dataIndex: 'scoringStrategy',
      valueType: 'text',
      hideInForm: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      hideInForm: true,
      hideInDescriptions: true,
      render: (text, record) => [
        <a
          key="editable"
          onClick={() => {
            handleRemove(record).then();
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.UserAnswerVO>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const res = await listMyUserAnswerVoByPageUsingPost({
            userId: loginUser?.id,
            ...params,
          });
          if (res?.data) {
            return {
              data: res.data.records || [],
              success: true,
              total: res.data.total,
            };
          } else {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        pagination={{
          pageSize: 10,
        }}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        dateFormatter="string"
        headerTitle="应用信息"
        toolBarRender={() => [
          <Dropdown
            key="menu"
            menu={{
              items: [
                {
                  label: '邓紫棋在这里',
                  key: '1',
                },
              ],
            }}
          >
            <Button>
              <EllipsisOutlined />
            </Button>
          </Dropdown>,
        ]}
      />
    </PageContainer>
  );
};
