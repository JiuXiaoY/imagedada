import { MailTwoTone } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      copyright="Above is a project, complete in 2024.05.29, Author: image"
      style={{
        background: 'whitesmoke',
      }}
      links={[
        {
          key: 'Image Link',
          title: 'Image GEM.dzq',
          href: 'https://cn.iamgem.com/',
          blankTarget: true,
        },
        {
          key: 'Mail',
          title: <MailTwoTone />,
          href: 'https://cn.iamgem.com/',
          blankTarget: true,
        },
        {
          key: 'Image link',
          title: 'IMAGE DZQ',
          href: 'https://cn.iamgem.com/',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
