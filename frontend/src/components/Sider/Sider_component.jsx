import React from "react";
import {
  AppstoreOutlined,
  FileTextOutlined,
  IdcardOutlined,
  UserOutlined,
  KeyOutlined,
  HomeOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Layout, Menu, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, selectUser } from "../../features/auth/authSlice";

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

function Sider_component({ collapsed = false, onCollapse, isMobile = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  // user: Current logged-in user
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    message.success("Logged out successfully");

    navigate("/login");
  };

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
      return;
    }
    navigate(key);
  };

  // Common Menu Items
  const commonItems = [
    {
      key: "/home",
      icon: <HomeOutlined />,
      label: "Home",
    },
  ];

  // Employee Menu Items
  const employeeItems = [
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
      key: "/hr/employeeProfiles",
      icon: <UserOutlined />,
      label: "Employee Profiles",
    },
    {
      key: "/hr/visaStatus",
      icon: <FileTextOutlined />,
      label: "Visa Status Management",
    },
    {
      key: "/hr/hiring_management",
      icon: <TeamOutlined />,
      label: "Hiring Management",
    },
  ];

  // Logout Menu Items
  const logoutItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      // onClick: handleLogout
    },
  ];

  // Dynamic Menu Items Based on Role
  const getMenuItems = () => {
    let items = [...commonItems];

    if (user?.role === "HR") {
      items = [...items, ...hrItems, ...logoutItems];
    } else {
      items = [...items, ...employeeItems, ...logoutItems];
    }
    return items;
  };

  const getSidebarTitle = () => {
    if (collapsed) {
      return user?.role === "HR" ? "HR" : "EMP";
    }
    if (user?.role === "HR") {
      return "HR Management";
    }
    return "Employee Management";
  };

  return (
    <Sider
      width={250}
      collapsible
      collapsed={collapsed}
      collapsedWidth={isMobile ? 64 : 80}
      trigger={null}
      onCollapse={onCollapse}
      style={siderStyle}
    >
      <div style={{ ...titleStyle, textAlign: collapsed ? "center" : "left" }}>
        {getSidebarTitle()}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        style={{ flex: 1, borderInlineEnd: 0 }}
        items={getMenuItems()}
      />
    </Sider>
  );
}
export default Sider_component;
