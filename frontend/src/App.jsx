import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import HeaderComponent from "./components/Header/Header.jsx";
import Sider_component from "./components/Sider/Sider_component.jsx";
import FooterComponent from "./components/Footer/Footer.jsx";
import DashboardPage from "./pages/Dashborad.jsx";
import OnboardingApplication from "./pages/Onboarding_Application.jsx";
import PersonApplication from "./pages/Person_Application.jsx";
import PersonInformation from "./pages/Person_information.jsx";
import VisaStatusManagement from "./pages/Visa_status.jsx";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "./features/auth/authSlice";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import HiringManagement from "./pages/hr/HiringManagement.jsx";
import EmployeeProfiles from "./pages/hr/EmployeeProfiles.jsx";
import EmployeeDetail from "./pages/hr/EmployeeDetail.jsx";
import Home from "./pages/Home.jsx";
import ApplicationReview from "./pages/hr/ApplicationReview.jsx";
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
    return <Navigate to="/home" replace />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 992px)");

    const handleChange = (event) => {
      setIsMobile(event.matches);
      setSiderCollapsed(event.matches);
    };

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const handleToggleSider = () => {
    setSiderCollapsed((prev) => !prev);
  };

  return (
    <Layout style={layoutStyle}>
      <Sider_component
        collapsed={siderCollapsed}
        onCollapse={setSiderCollapsed}
        isMobile={isMobile}
      />
      <Layout>
        <HeaderComponent
          isMobile={isMobile}
          onMenuClick={handleToggleSider}
        />
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
          <Navigate to="/home" replace />
        </ProtectedRoute>
      }
    />
    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Home />
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
      path="/hr/application-review/:id"
      element={
        <ProtectedRoute requiredRole="HR">
          <AppLayout>
            <ApplicationReview />
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
      path="/hr/employeeProfiles"
      element={
        <ProtectedRoute requiredRole="HR">
          <AppLayout>
            <EmployeeProfiles />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/hr/employee/:id"
      element={
        <ProtectedRoute requiredRole="HR">
          <AppLayout>
            <EmployeeDetail />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/hr/visaStatus"
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
