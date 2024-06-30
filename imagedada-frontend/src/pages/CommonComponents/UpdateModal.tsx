import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import { Modal } from 'antd';
import React, { useEffect, useRef } from 'react';

export type Props = {
  values: any;
  columns: ProColumns[];
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  visible: boolean;
};

const UpdateModal: React.FC<Props> = (props) => {
  const { values, visible, columns, onCancel, onSubmit } = props;

  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    let temp;
    if (values.resultProp) {
      temp = {
        ...values,
        resultProp: JSON.parse(values.resultProp),
      };
    }
    if (values.choices) {
      console.log(values.choices)
      temp = {
        ...values,
        choices: JSON.parse(values.choices),
      };
    }
    if (formRef) {
      formRef.current?.setFieldsValue(temp);
    }
  }, [values]);

  return (
    <Modal open={visible} footer={null} onCancel={() => onCancel?.()}>
      <ProTable
        type="form"
        formRef={formRef}
        columns={columns}
        onSubmit={async (value) => {
          onSubmit?.(value);
        }}
      />
    </Modal>
  );
};
export default UpdateModal;
