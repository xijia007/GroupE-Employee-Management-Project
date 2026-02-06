// ═══════════════════════════════════════════════════════════
// Register.jsx - Employee Registration Page
//
// Purpose:
//   Allow new employees to register with a valid token
//
// Flow:
//   1. Get token from URL query parameter
//   2. Verify token validity
//   3. Show registration form
//   4. Submit registration data
//   5. Redirect to login page
// ═══════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Space, Alert, Spin } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';


// Styles 
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '20px',
};

const cardStyle = {
  width: '100%',
  maxWidth: '500px',
  borderRadius: '12px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
};

const headerStyle = {
  textAlign: 'center',
  paddingTop: '20px',
}; 

// Register Component 
const Register = () => {
  // State 
  const [form] = Form.useForm(); // Ant Design form instance 
  
  const [loading, setLoading] = useState(false); // Registration submission loading state
  
  const [verifyingToken, setVerifyingToken] = useState(true); // Token verification loading state
  
  const [tokenValid, setTokenValid] = useState(false); // Whether the token is valid
  
  const [tokenError, setTokenError] = useState(''); // Error message if token is invalid

  // Hooks 
  const navigate = useNavigate(); // Navigate to different pages 
  
  const [searchParams] = useSearchParams(); // Get URL query parameters
  // Example: /register?token=abc123 → searchParams.get('token') = 'abc123'
  
  const token = searchParams.get('token'); // Registration token from URL 

  // useEffect: Verify token when component mounts
  useEffect(() => {
    // Check 1: Token must exist in URL
    if (!token) {
      setTokenError('No registration token provided. Please use the link from your invitation email.');
      // 未提供令牌
      setTokenValid(false);
      setVerifyingToken(false);
      return;
    }

    // Check 2: Verify token with backend
    const verifyToken = async () => {
      try {
        setVerifyingToken(true);
        
        // API call to verify token / API 调用验证令牌
        const response = await api.get(`/auth/registration-token/${token}`);
        // Backend returns: { email: "user@example.com", name: "John Doe" }
        // 后端返回: { email: "user@example.com", name: "John Doe" }
        
        // Check: If response has email, token is valid
        if (response.data && response.data.email) {
          setTokenValid(true);
          // Token is valid
          
          // Pre-fill email and name if provided
          form.setFieldsValue({ 
            email: response.data.email,
            firstName: response.data.name ? response.data.name.split(' ')[0] : '',
            lastName: response.data.name ? response.data.name.split(' ')[1] : '',
          });
        } else {
          setTokenError('Invalid or expired registration token.');
          // 令牌无效或已过期
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setTokenError(
          error.response?.data?.message || 
          'Failed to verify token. Please contact HR for assistance.'
        );
        // 验证失败
        setTokenValid(false);
      } finally {
        setVerifyingToken(false);
      }
    };

    verifyToken();
  }, [token, form]);

  // Handle Registration Form Submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Step 1: Prepare registration data
      const registrationData = {
        username: values.username,
        password: values.password,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        token: token,  // Include token for verification
      };

      // Step 2: Call registration API
      const response = await api.post('/auth/register', registrationData);
      // Backend will:
      // 后端将：
      // 1. Verify token validity / 验证令牌有效性
      // 2. Check username uniqueness / 检查用户名唯一性
      // 3. Create user account / 创建用户账号
      // 4. Mark token as used / 标记令牌已使用

      // ──────────────────────────────────────────────────────
      // Step 3: Show success message
      // 步骤 3: 显示成功消息
      // ──────────────────────────────────────────────────────
      message.success(
        'Registration successful! Redirecting to login page...',
        3
      );
      // 注册成功！跳转到登录页面...

      // ──────────────────────────────────────────────────────
      // Step 4: Redirect to login page after 2 seconds
      // 步骤 4: 2 秒后跳转到登录页面
      // ──────────────────────────────────────────────────────
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      
      // ──────────────────────────────────────────────────────
      // Handle different error types
      // 处理不同类型的错误
      // ──────────────────────────────────────────────────────
      const errorMessage = error.response?.data?.message || 
        'Registration failed. Please try again.';
      
      message.error(errorMessage);
      // Common errors / 常见错误:
      // - "Username already exists" / 用户名已存在
      // - "Invalid token" / 令牌无效
      // - "Token already used" / 令牌已使用
      
    } finally {
      setLoading(false);
    }
  };

  // Render: Token Verification Loading
  if (verifyingToken) {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '20px', color: '#666' }}>
              Verifying your registration token...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Render: Invalid Token Error
  if (!tokenValid) {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <Alert
            message="Invalid Registration Link"
            description={tokenError}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          <Button 
            type="primary" 
            block 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  // Render: Registration Form
  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        {/* Header / 标题 */}
        <div style={headerStyle}>
          <SafetyOutlined style={{ fontSize: '48px', color: '#667eea' }} />
          <h1 style={{ margin: '16px 0 8px', fontSize: '28px' }}>
            Employee Registration
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Create your account to get started
          </p>
        </div>

        {/* Registration Form / 注册表单 */}
        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          style={{ marginTop: '32px' }}
        >

          {/* Username / 用户名 */}
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your username!',
                // 请输入用户名
              },
              {
                min: 3,
                message: 'Username must be at least 3 characters',
                // 用户名至少 3 个字符
              },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores',
                // 用户名只能包含字母、数字和下划线
              },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Choose a username"
            />
          </Form.Item>

          {/* Email / 邮箱 */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email!',
                // 请输入邮箱
              },
              {
                type: 'email',
                message: 'Please enter a valid email!',
                // 请输入有效的邮箱
              },
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="your.email@example.com"
            />
          </Form.Item>

          {/* First Name / 名字 */}
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[
              {
                required: true,
                message: 'Please input your first name!',
                // 请输入名字
              },
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="First Name"
            />
          </Form.Item>

          {/* Last Name / 姓氏 */}
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              {
                required: true,
                message: 'Please input your last name!',
                // 请输入姓氏
              },
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="Last Name"
            />
          </Form.Item>

          {/* Password / 密码 */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
                // 请输入密码
              },
              {
                min: 8,
                message: 'Password must be at least 8 characters',
                // 密码至少 8 个字符
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number',
                // 密码必须包含大写字母、小写字母和数字
              },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Create a strong password"
            />
          </Form.Item>

          {/* Confirm Password / 确认密码 */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            // dependencies: Re-validate when password changes
            // dependencies: 密码改变时重新验证
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
                // 请确认密码
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                    // Passwords match / 密码匹配
                  }
                  return Promise.reject(
                    new Error('The two passwords do not match!')
                  );
                  // 两次密码不一致
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm your password"
            />
          </Form.Item>

          {/* Submit Button / 提交按钮 */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{
                  height: '48px',
                  fontSize: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#666' }}>Already have an account? </span>
                <Button 
                  type="link" 
                  onClick={() => navigate('/login')}
                  style={{ padding: 0 }}
                >
                  Sign In
                </Button>
              </div>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;