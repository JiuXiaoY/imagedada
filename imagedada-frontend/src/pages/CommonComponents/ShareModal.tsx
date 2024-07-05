import '@umijs/max';
import { Modal, QRCode, Typography } from 'antd';
import React from 'react';

const { Paragraph } = Typography;

export type Props = {
  visible: boolean;
  linkUrl: string;
  onCancel: () => void;
};

const UpdateModal: React.FC<Props> = (props) => {
  const { visible, linkUrl, onCancel } = props;

  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={() => onCancel?.()}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      closable={false}
      keyboard={true}
      title="分享应用"
    >
      <h4 style={{ marginTop: 16 }}>复制链接分享</h4>
      <Paragraph copyable>{linkUrl}</Paragraph>
      <h4 style={{ marginTop: 16 }}>手机扫码查看</h4>
      <QRCode size={300} errorLevel="H" value={linkUrl} icon="http://bt.imagegem.cn/favicon.png" />
    </Modal>
  );
};
export default UpdateModal;
