import { ProColumns, ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import { Modal } from 'antd';
import React from 'react';

export type Props = {
  columns: ProColumns[];
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
};
const CreateModal: React.FC<Props> = (props) => {
  const { visible, onCancel, onSubmit, columns } = props;
  return (
    <Modal open={visible} footer={null} onCancel={() => onCancel?.()}>
      {}
      <ProTable
        type="form"
        columns={columns}
        onSubmit={async (value) => {
          onSubmit?.(value);
        }}
      />
    </Modal>
  );
};
export default CreateModal;
