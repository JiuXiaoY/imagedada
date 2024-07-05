import CreateModal from '@/pages/CommonComponents/CreateModal';
import UpdateModal from '@/pages/CommonComponents/UpdateModal';
import {
  addScoringResultUsingPost,
  deleteScoringResultUsingPost,
  listScoringResultByPageUsingPost,
  updateScoringResultUsingPost,
} from '@/services/imagedada-backend/scoringResultController';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { Button, Drawer, Dropdown, Image, Select, message } from 'antd';
import { useRef, useState } from 'react';

export default () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [selectedRowsState, setSelectedRows] = useState<API.ScoringResult[]>([]);
  const [currentRow, setCurrentRow] = useState<API.ScoringResult>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();

  /**
   * @en-US Add node
   * @zh-CN 添加接口
   * @param fields
   */
  const handleAdd = async (fields: API.ScoringResultAddRequest) => {
    const hide = message.loading('正在添加');
    try {
      await addScoringResultUsingPost({
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
  const handleUpdate = async (fields: API.ScoringResultUpdateRequest) => {
    if (!currentRow) {
      console.log('ex');
      return;
    }
    const hide = message.loading('修改中');
    try {
      await updateScoringResultUsingPost({
        id: currentRow.id,
        ...fields,
      });
      hide();
      message.success('操作成功');
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };

  const handleRemove = async (record: API.ScoringResult) => {
    const hide = message.loading('正在删除');
    if (!record) return true;
    try {
      await deleteScoringResultUsingPost({
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
  // const handleBatchRemove = async () => {
  //   const hide = message.loading('正在批量删除');
  //   if (!selectedRowsState || selectedRowsState.length <= 0) {
  //     hide();
  //     message.error('请选择需要删除的数据');
  //     return;
  //   }
  //   const ids = selectedRowsState.map((item) => item.id!);
  //   try {
  //     await deleteBatchInterfaceInfoUsingPost({
  //       ids: ids
  //     });
  //     hide();
  //     message.success('批量删除成功');
  //     return true;
  //   } catch (error: any) {
  //     hide();
  //     message.error('删除失败，' + error.message);
  //     return false;
  //   }
  // };

  const columns: ProColumns<API.ScoringResult>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'index',
    },
    {
      title: 'APPID',
      dataIndex: 'appId',
      valueType: 'text',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      valueType: 'text',
      hideInForm: true,
    },
    {
      title: '结果描述',
      dataIndex: 'resultDesc',
      valueType: 'text',
    },
    {
      title: '结果名称',
      dataIndex: 'resultName',
      valueType: 'text',
    },
    {
      title: '结果图标',
      dataIndex: 'resultPicture',
      valueType: 'image',
      render: (text, record) => <Image src={record.resultPicture} width={50} height={50} />,
      hideInSearch: true,
    },
    {
      title: '结果属性',
      dataIndex: 'resultProp',
      renderFormItem: (_, { type, defaultRender, ...rest }, form) => {
        if (type === 'form') {
          return (
            <Select
              {...rest}
              mode="tags"
              placeholder="输入并按回车键添加标签"
              onChange={(value) => {
                form.setFieldValue('resultProp', value); // 将标签数组设置为表单字段的值
              }}
              style={{ width: '100%' }}
            />
          );
        }
        return defaultRender(_);
      },
    },
    {
      title: '得分',
      dataIndex: 'resultScoreRange',
      valueType: 'text',
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
      hideInForm: true,
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
      <ProTable<API.ScoringResult>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const res = await listScoringResultByPageUsingPost({
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
              // await handleRemove(selectedRowsState);
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
        <ProDescriptions<API.ScoringResult>
          column={1}
          title={currentRow?.resultName}
          request={async () => ({
            data: currentRow || {},
          })}
          params={{
            id: currentRow?.id,
            appDesc: currentRow?.resultName,
            appName: currentRow?.resultDesc,
          }}
          columns={columns as ProDescriptionsItemProps<API.ScoringResult>[]}
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
