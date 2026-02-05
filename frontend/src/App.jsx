import React from "react";
import { Layout } from "antd";
import HeaderComponent from "./components/Header/Header.jsx";
import Sider_component from "./components/Sider/Sider_component.jsx";
import FooterComponent from "./components/Footer/Footer.jsx";
import DashboardPage from "./pages/Dashborad.jsx";
import OnboardingApplication from "./pages/Onboarding_application.jsx";
import PersonApplication from "./pages/Person_Application.jsx";
import PersonInformation from "./pages/Person_information.jsx";
import VisaStatusManagement from "./pages/Visa_status.jsx";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "./features/auth/authSlice";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import HiringManagement from "./pages/hr/HiringManagement.jsx";
import HR_VisaStatus from "./pages/hr/HR_VisaStatus.jsx";

const { Content } = Layout;

const contentStyle = {
  textAlign: "center",
  minHeight: "calc(100vh - 128px)",
  lineHeight: "120px",
  color: "#000",
  backgroundColor: "#f6f7fb",
};

const layoutStyle = {
  minHeight: "100vh",
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const user = useSelector(selectUser);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  return (
    <Layout style={layoutStyle}>
      <Sider_component />
      <Layout>
        <HeaderComponent />
        <Content style={contentStyle}>{children}</Content>
        <FooterComponent />
      </Layout>
    </Layout>
  );
};
const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/onboarding"
      element={
        <ProtectedRoute>
          <AppLayout>
            <OnboardingApplication />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/personApplication"
      element={
        <ProtectedRoute>
          <AppLayout>
            <PersonApplication />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/personInformation"
      element={
        <ProtectedRoute>
          <AppLayout>
            <PersonInformation />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/visaStatus"
      element={
        <ProtectedRoute>
          <AppLayout>
            <VisaStatusManagement />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/hr/hiring_management"
      element={
        <ProtectedRoute requiredRole="HR">
          <AppLayout>
            <HiringManagement />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/hr/hiring_visa_status"
      element={
        <ProtectedRoute requiredRole="HR">
          <AppLayout>
            <HR_VisaStatus />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
