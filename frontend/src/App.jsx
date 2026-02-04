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
import HR_VisaStatus from "./pages/HR_VisaStatus.jsx";
import { Route, Routes } from "react-router-dom";
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
const App = () => (
  <Layout style={layoutStyle}>
    <Sider_component />
    <Layout>
      <HeaderComponent />
      <Content style={contentStyle}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/onboarding" element={<OnboardingApplication />} />
          <Route path="/personApplication" element={<PersonApplication />} />
          <Route path="/personInformation" element={<PersonInformation />} />
          <Route path="/visaStatus" element={<VisaStatusManagement />} />
          <Route path="/hrVisaStatus" element={<HR_VisaStatus />} />
        </Routes>
      </Content>
      <FooterComponent />
    </Layout>
  </Layout>
);

export default App;
