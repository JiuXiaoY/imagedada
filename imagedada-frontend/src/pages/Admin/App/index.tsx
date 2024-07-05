import CreateModal from '@/pages/CommonComponents/CreateModal';
import UpdateModal from '@/pages/CommonComponents/UpdateModal';
import {
  addAppUsingPost,
  deleteAppUsingPost, deleteBatchAppUsingPost,
  listAppByPageUsingPost,
  reviewAppUsingPost,
  updateAppUsingPost,
} from '@/services/imagedada-backend/appController';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { Button, Drawer, Dropdown, Image, message } from 'antd';
import { useRef, useState } from 'react';

export default () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [selectedRowsState, setSelectedRows] = useState<API.App[]>([]);
  const [currentRow, setCurrentRow] = useState<API.App>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();

  /**
   * @en-US Add node
   * @zh-CN 添加接口
   * @param fields
   */
  const handleAdd = async (fields: API.App) => {
    const hide = message.loading('正在添加');
    try {
      await addAppUsingPost({
        ...fields,
      });
      hide();
      message.success('创建成功');
      actionRef.current?.reload();
      handleModalOpen(false);
      return true;
    } catch (error: any) {
      hide();
      message.error('创建失败，' + error.message);
      return false;
    }
  };

  /**
   * 更新数据
   *
   * @param fields
   */
  const handleUpdate = async (fields: API.App) => {
    if (!currentRow) {
      return;
    }
    const hide = message.loading('修改中');
    try {
      await updateAppUsingPost({
        id: currentRow.id,
        ...fields,
      });
      hide();
      message.success('操作成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };

  const handleRemove = async (record: API.App) => {
    const hide = message.loading('正在删除');
    if (!record) return true;
    try {
      await deleteAppUsingPost({
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

  /**
   *  Delete batch node
   * @zh-CN todo 批量删除接口
   *
   * @param
   */
  const handleBatchRemove = async () => {
    const hide = message.loading('正在批量删除');
    if (!selectedRowsState || selectedRowsState.length <= 0) {
      hide();
      message.error('请选择需要删除的数据');
      return;
    }
    const ids = selectedRowsState.map((item) => item.id!);
    try {
      await deleteBatchAppUsingPost({
        ids: ids,
      });
      hide();
      message.success('批量删除成功');
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  const handleReview = async () => {
    if (!currentRow) {
      return;
    }
    const hide = message.loading('审核中');
    try {
      await reviewAppUsingPost({
        id: currentRow.id,
        reviewStatus: 1,
        reviewMessage: currentRow.reviewMessage,
      });
      hide();
      message.success('审核成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };

  const columns: ProColumns<API.App>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'index',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      valueType: 'text',
      hideInForm: true,
    },

    {
      title: '应用描述',
      dataIndex: 'appDesc',
      valueType: 'text',
    },
    {
      title: '应用图标',
      dataIndex: 'appIcon',
      valueType: 'image',
      render: (text, record) => <Image src={record.appIcon} width={50} height={50} />,
      hideInSearch: true,
    },
    {
      title: '应用名称',
      dataIndex: 'appName',
      valueType: 'text',
    },
    {
      title: '应用类型',
      dataIndex: 'appType',
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
      title: '审核信息',
      dataIndex: 'reviewMessage',
      valueType: 'text',
      hideInForm: true,
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      valueEnum: {
        0: {
          text: '待审核',
          status: 'Default',
        },
        1: {
          text: '通过',
          status: 'Success',
        },
        2: {
          text: '拒绝',
          status: 'Error',
        },
      },
      hideInForm: true,
    },
    {
      title: '审核时间',
      dataIndex: 'reviewTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: '审核人ID',
      dataIndex: 'reviewerId',
      valueType: 'text',
      hideInForm: true,
    },
    {
      title: '得分策略',
      dataIndex: 'scoringStrategy',
      hideInForm: true,
      valueEnum: {
        0: {
          text: '自定义',
        },
        1: {
          text: 'AI',
        },
      },
    },

    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInForm: true,
    },

    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      hideInDescriptions: true,
      render: (text, record) => [
        <a
          key="editable"
          onClick={() => {
            setCurrentRow(record);
            handleUpdateModalOpen(true);
          }}
        >
          编辑
        </a>,
        <a
          key="review"
          onClick={() => {
            setCurrentRow(record);
            handleReview().then();
          }}
        >
          审核
        </a>,
        <TableDropdown
          key="actionGroup"
          onSelect={(key) => {
            if (key === 'conCreate') {
              setCurrentRow(record);
              setShowDetail(true);
            }
            if (key === 'delete') {
              handleRemove(record).then();
            }
          }}
          menus={[
            { key: 'conCreate', name: '详情' },
            { key: 'delete', name: '删除' },
          ]}
        />,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.App>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const res = await listAppByPageUsingPost({
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
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              handleModalOpen(true);
            }}
            type="primary"
          >
            新建
          </Button>,
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
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项 &nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleBatchRemove();
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <Drawer
        width={400}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        <ProDescriptions<API.App>
          column={1}
          title={currentRow?.appName}
          request={async () => ({
            data: currentRow || {},
          })}
          params={{
            id: currentRow?.id,
            appDesc: currentRow?.appDesc,
            appName: currentRow?.appName,
          }}
          columns={columns as ProDescriptionsItemProps<API.App>[]}
        />
      </Drawer>
      <UpdateModal
        columns={columns}
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        visible={updateModalOpen}
        values={currentRow || {}}
      />
      <CreateModal
        columns={columns}
        onCancel={() => {
          handleModalOpen(false);
        }}
        onSubmit={(values) => {
          // todo 添加信息
          handleAdd(values).then();
        }}
        visible={createModalOpen}
      />
    </PageContainer>
  );
};
