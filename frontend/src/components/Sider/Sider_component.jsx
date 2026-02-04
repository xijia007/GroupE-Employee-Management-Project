import React from "react";
import {
  AppstoreOutlined,
  FileTextOutlined,
  IdcardOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const siderStyle = {
  color: "#000",
  backgroundColor: "#fff",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
};

const titleStyle = {
  padding: 16,
  fontWeight: 700,
  fontSize: 16,
  lineHeight: "24px",
  textAlign: "left",
  borderBottom: "1px solid #f0f0f0",
};

function Sider_component() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/",
      icon: <AppstoreOutlined />,
      label: "Employee Dashboard",
    },
    {
      key: "/onboarding",
      icon: <FileTextOutlined />,
      label: "Onboarding Application",
    },
    {
      key: "/personApplication",
      icon: <UserOutlined />,
      label: "Personal Application",
    },
    {
      key: "/personInformation",
      icon: <IdcardOutlined />,
      label: "Personal Information",
    },
    {
      key: "/visaStatus",
      icon: <FileTextOutlined />,
      label: "Visa Status Management",
    },
    {
      key: "/hrVisaStatus",
      icon: <FileTextOutlined />,
      label: "HR Visa Status Management",
    },
  ];

  return (
    <Sider width={250} style={siderStyle}>
      <div style={titleStyle}>Employee Management</div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        style={{ flex: 1, borderInlineEnd: 0 }}
        items={items}
      />
    </Sider>
  );
}
export default Sider_component;
