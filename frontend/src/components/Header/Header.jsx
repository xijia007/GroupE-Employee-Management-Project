import React from "react";
import { Avatar, Badge, Input, Layout, Space, Dropdown, message, Button } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  MailOutlined,
  LogoutOutlined,
  DownOutlined,
  MenuOutlined  
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../../features/auth/authSlice';

const { Header } = Layout;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#000",
  height: 64,
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

function HeaderComponent({ isMobile = false, onMenuClick }) {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logoutUser());
    message.success('Logged out successfully');

    navigate('/login');
  };

  const menuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ 
          padding: '8px 12px', 
          borderBottom: '1px solid #f0f0f0' 
        }}>
          <div style={{ 
            fontWeight: 600, 
            color: '#000',
            fontSize: '14px'
          }}>
            {user?.username || 'User'}
          </div>

          <div style={{ 
            fontSize: '12px', 
            color: '#999', 
            marginTop: '4px' 
          }}>
            {user?.role || 'Employee'}
          </div>
        </div>
      ),
      disabled: true
    },
    {
      key: 'logout',
      // Logout option identifier
      label: (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: '#ff4d4f', 
          padding: '4px 0'
        }}>
          <LogoutOutlined style={{ marginRight: '8px' }} />
          {/* Logout icon with spacin */}
          
          Logout
          {/* Text: "Logout" */}
        </div>
      ),
      onClick: handleLogout
    }
  ];

    return (
    <Header style={{ ...headerStyle, paddingInline: isMobile ? 16 : 48 }}>
      <Space align="center" size="middle">
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          />
        )}
        <Input
          placeholder="Search in PMS"
          prefix={<SearchOutlined />}
          style={{ width: isMobile ? 180 : 320 }}
          allowClear
        />
      </Space>

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

        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <span style={{
            ...actionItemStyle,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Avatar
              size={24}
              src={null}
              icon={<UserOutlined style={{ fontSize: 14 }} />}
              style={{ backgroundColor: '#667eea' }}
            />
            <DownOutlined style={{ fontSize: 10, color: '#999' }} />
          </span>
        </Dropdown>
      </Space>
    </Header>
  );
}

export default HeaderComponent;
