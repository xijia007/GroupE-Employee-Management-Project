import React from "react";
import { Avatar, Badge, Input, Layout, Space } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
const { Header } = Layout;
const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#000",
  height: 64,
  paddingInline: 48,
  backgroundColor: "#fff",
  borderRadius: "8px",
};

const actionItemStyle = {
  display: "flex",
  alignItems: "center",
  height: 24,
  lineHeight: 0,
};

const actionIconStyle = {
  fontSize: 18,
  lineHeight: 1,
  display: "block",
};

function HeaderComponent() {
  return (
    <Header style={headerStyle}>
      <Input
        placeholder="Search in PMS"
        prefix={<SearchOutlined />}
        style={{ width: 320 }}
        allowClear
      />

      <Space
        size="middle"
        align="center"
        style={{ display: "flex", alignItems: "center" }}
      >
        <span style={actionItemStyle}>
          <Badge dot>
            <BellOutlined style={actionIconStyle} />
          </Badge>
        </span>

        <span style={actionItemStyle}>
          <SettingOutlined style={actionIconStyle} />
        </span>

        <span style={actionItemStyle}>
          <MailOutlined style={actionIconStyle} />
        </span>

        <span style={actionItemStyle}>
          <Avatar
            size={24}
            src={null}
            icon={<UserOutlined style={{ fontSize: 14 }} />}
          />
        </span>
      </Space>
    </Header>
  );
}

export default HeaderComponent;
