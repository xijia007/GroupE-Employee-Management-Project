import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Form, 
    Input, 
    Button, 
    Card, 
    message, 
    Typography, 
    Alert 
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { clearError, loginUser, selectAuthError, selectAuthLoading, selectUser } from '../../features/auth/authSlice';

const { Title, Text } = Typography;

const Login = () => {
    // Hooks 
    const dispatch = useDispatch(); // dispatch: Call Redux actions

    const navigate = useNavigate(); // Navigate to different pages

    // Get state from Redux store 
    const user = useSelector(selectUser);
    
    const loading = useSelector(selectAuthLoading);

    const error = useSelector(selectAuthError);

    // ════════════════════════════════════════════════════════
    // useEffect: Navigate after successful login
    // useEffect: 登录成功后导航
    //
    // IMPORTANT: Only redirect when on login page to avoid loop
    // 重要：仅在登录页面时重定向以避免循环
    // ════════════════════════════════════════════════════════
    useEffect(() => {
        if (!user || window.location.pathname !== '/login') return;

        // ════════════════════════════════════════════════════════
        // Redirect based on onboardingStatus from login response
        // 使用 login 返回的 onboardingStatus 来决定跳转
        //
        // This avoids an extra API call that could have timing issues
        // with the newly-set token.
        // ════════════════════════════════════════════════════════
        const redirectByStatus = () => {
            message.success(`Welcome back, ${user.username}!`);

            if (user.role === 'HR') {
                navigate('/home', { replace: true });
                return;
            }

            const status = user.onboardingStatus;

            if (status === 'Approved') {
                // Approved employees go to personal information
                navigate('/personInformation', { replace: true });
                return;
            }

            if (status === 'Never Submitted' || status === 'Rejected') {
                // Need to fill out or revise the onboarding form
                navigate('/onboarding', { replace: true });
                return;
            }

            // Pending → go to home page which shows "Under Review" message
            // 待审批 → 跳转到首页，显示"审核中"提示
            navigate('/home', { replace: true });
        };

        redirectByStatus();
    }, [user, navigate]);

    // Handle form submission
    const handleSubmit = (values) => {
        // Clear previous error 
        dispatch(clearError());

        // Dispatch login action
        dispatch(loginUser({
            username: values.username,
            password: values.password
        }));
        // This triggers the async thunk / 这会触发异步 thunk
        // 1. pending → loading = true
        // 2. API call → POST /api/auth/login
        // 3. fulfilled → update user state / 更新用户状态
        //    OR rejected → set error / 或设置错误
    };


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      {/* Login Card */}
      <Card
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        }}
        variant="borderless"
      >
        {/* Title Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={2} style={{ marginBottom: "8px", color: "#667eea" }}>
            Employee Management
          </Title>
          <Text>Sign in to your account</Text>
        </div>
        {/* Error Alert */}
        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(clearError())}
            style={{ marginBottom: "24px" }}
          />
        )}

        {/* Login Form */}
        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          {/* Username Field */}
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Please enter your username",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#667eea" }} />}
              placeholder="Username"
              disabled={loading}
            />
          </Form.Item>
          {/* Password Field */}
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#667eea" }} />}
              placeholder="Password"
              disabled={loading}
            />
          </Form.Item>

          {/* Submit Button*/}
          <Form.Item style={{ marginBottom: "0" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: "48px",
                fontSize: "16px",
                fontWeight: "600",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "8px",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form.Item>
        </Form>
        {import.meta.env.DEV && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "#f6f8fa",
              borderRadius: "8px",
            }}
          >
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Test Accounts:
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: "12px", display: "block" }}
            >
              HR: hr_admin_1 / HRAdmin123!
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: "12px", display: "block" }}
            >
              Employee: (Register via HR invitation)
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;
