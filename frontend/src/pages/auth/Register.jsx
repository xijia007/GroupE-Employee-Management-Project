// Register.jsx - Employee Registration Page

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
import { useDispatch } from 'react-redux';
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
  
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');

  // Hooks 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 

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
        
        // API call to verify token
        const response = await api.get(`/auth/registration-token/${token}`);
        // Backend returns: { email: "user@example.com", name: "John Doe" }

        
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
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setTokenError(
          error.response?.data?.message || 
          'Failed to verify token. Please contact HR for assistance.'
        );
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

      message.success(
        'Registration successful! Redirecting to login page...',
        3
      );

      // Step 4: Clear any existing auth state, then redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      setTimeout(() => {
        // Force a full page reload to /login to reset Redux store completely
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessage = error.response?.data?.message || 
        'Registration failed. Please try again.';
      
      message.error(errorMessage);
      
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
        {/* Header */}
        <div style={headerStyle}>
          <SafetyOutlined style={{ fontSize: '48px', color: '#667eea' }} />
          <h1 style={{ margin: '16px 0 8px', fontSize: '28px' }}>
            Employee Registration
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          style={{ marginTop: '32px' }}
        >

          {/* Username */}
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your username!',

              },
              {
                min: 3,
                message: 'Username must be at least 3 characters',

              },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores',

              },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Choose a username"
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email!',

              },
              {
                type: 'email',
                message: 'Please enter a valid email!',

              },
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="your.email@example.com"
            />
          </Form.Item>

          {/* First Name */}
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[
              {
                required: true,
                message: 'Please input your first name!',

              },
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="First Name"
            />
          </Form.Item>

          {/* Last Name */}
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              {
                required: true,
                message: 'Please input your last name!',

              },
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="Last Name"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',

              },
              {
                min: 8,
                message: 'Password must be at least 8 characters',

              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number',

              },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Create a strong password"
            />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            // dependencies: Re-validate when password changes
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',

              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                    // Passwords match
                  }
                  return Promise.reject(
                    new Error('The two passwords do not match!')
                  );

                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm your password"
            />
          </Form.Item>

          {/* Submit Button */}
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