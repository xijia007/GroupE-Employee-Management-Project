import React from "react";
import {
  AppstoreOutlined,
  FileTextOutlined,
  IdcardOutlined,
  UserOutlined,
  KeyOutlined,
  HomeOutlined,        
  TeamOutlined, 
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';

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
  // user: Current logged-in user 
  const user = useSelector(selectUser);

  // Common Menu Items 
  const commonItems = [
    {    
      key: '/home',
      icon: <HomeOutlined />,
      label: 'Home',
    }
  ];

  // Employee Menu Items
  const employeeItems = [
    {
      key: "/dashboard",
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
  ];

  // HR Menu Items 
  const hrItems = [
    {
      key: "/hr/hiring_management",
      icon: <TeamOutlined />,
      label: "Hiring Management",
    },
    {
      key: "/hr/generate-token",
      icon: <KeyOutlined />,
      label: "Generate Registration Token",
    },
  ];

  // Dynamic Menu Items Based on Role
  const getMenuItems = () => {
    let items = [...commonItems];

    if (user?.role === 'HR') {
        items = [...items, ...hrItems];
    } else {
      items = [...items, ...employeeItems];
    }
    return items;
  }

  const getSidebarTitle = () => {
    if (user?.role === 'HR') {
      return 'HR Management';
    } 
    return 'Employee Management';
  }



  return (
    <Sider width={250} style={siderStyle}>
      <div style={titleStyle}>
        {getSidebarTitle()}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        style={{ flex: 1, borderInlineEnd: 0 }}
        items={getMenuItems()}
      />
    </Sider>
  );
}
export default Sider_component;
