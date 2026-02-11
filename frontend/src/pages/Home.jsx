import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Alert,
  Spin,
  List,
  Avatar,
  Tag,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../features/auth/authSlice";
import api from "../services/api";

const { Title, Paragraph, Text } = Typography;

function HomePage() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [profile, setProfile] = useState(null);

  // HR Dashboard state
  const [hrDashboard, setHrDashboard] = useState({
    pendingApplications: 0,
    pendingVisaDocuments: 0,
    totalEmployees: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === "Employee") {
        setLoading(true);
        try {
          // Fetch onboarding status
          const statusResponse = await api.get("/onboarding/status");
          setApplicationStatus(statusResponse.data.status);
          setFeedback(statusResponse.data.feedback || "");

          // Fetch profile for visa document status
          try {
            const profileResponse = await api.get("/info/profile");
            setProfile(profileResponse.data);
          } catch (profileError) {
            console.log("Profile not found, user might not be approved yet");
          }
        } catch (error) {
          console.error("Error fetching status:", error);
        } finally {
          setLoading(false);
        }
      }

      // Fetch HR dashboard data
      if (user?.role === "HR") {
        setLoading(true);
        try {
          // Fetch pending applications
          const applicationsResponse = await api.get(
            "/hr/applications?status=Pending",
          );
          const pendingApps = applicationsResponse.data.count || 0;

          // Fetch all employees
          const employeesResponse = await api.get("/hr/employees");
          const totalEmps = employeesResponse.data.count || 0;

          // Fetch pending visa documents
          const visaResponse = await api.get("/hr/visa-status");
          const visaEmployees = visaResponse.data.employees || [];
          const pendingDocs = visaEmployees.filter((emp) => {
            const docs = emp.profile?.visaDocuments || {};
            return (
              docs.optReceipt?.status === "pending" ||
              docs.optEad?.status === "pending" ||
              docs.i983?.status === "pending" ||
              docs.i20?.status === "pending"
            );
          }).length;

          setHrDashboard({
            pendingApplications: pendingApps,
            pendingVisaDocuments: pendingDocs,
            totalEmployees: totalEmps,
          });

          // Process Recent Activity
          // 1. Recent applications
          const allApplicationsResponse = await api.get("/hr/applications");
          const allApps = allApplicationsResponse.data.applications || [];

          const appActivities = allApps
            .filter(
              (app) =>
                (app.status === "Approved" || app.status === "Rejected") &&
                (app.reviewedAt || app.updatedAt),
            )
            .map((app) => ({
              id: `app-${app._id}`,
              type: "Application",
              user: `${app.firstName} ${app.lastName}`,
              status: app.status,
              date: new Date(app.reviewedAt || app.updatedAt),
              details: `Onboarding Application`,
            }));

          // 2. Recent visa documents
          const docActivities = [];
          visaEmployees.forEach((emp) => {
            const docs = emp.profile?.visaDocuments || {};
            const docTypes = ["optReceipt", "optEad", "i983", "i20"];
            const docNames = {
              optReceipt: "OPT Receipt",
              optEad: "OPT EAD",
              i983: "I-983",
              i20: "I-20",
            };

            docTypes.forEach((type) => {
              const doc = docs[type];
              if (
                doc &&
                (doc.status === "approved" || doc.status === "rejected") &&
                doc.reviewedAt
              ) {
                docActivities.push({
                  id: `doc-${emp._id}-${type}`,
                  type: "Visa",
                  user: emp.username,
                  status:
                    doc.status.charAt(0).toUpperCase() + doc.status.slice(1),
                  date: new Date(doc.reviewedAt),
                  details: docNames[type],
                });
              }
            });
          });

          // Combine and sort
          const activities = [...appActivities, ...docActivities]
            .sort((a, b) => b.date - a.date)
            .slice(0, 10); // Show top 10

          setRecentActivities(activities);
        } catch (error) {
          console.error("Error fetching HR dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Render HR Dashboard
  const renderHRDashboard = () => {
    if (user?.role !== "HR") return null;

    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 16 }}>
          📊 Dashboard Overview
        </Title>

        {/* Action Required Alert */}
        {(hrDashboard.pendingApplications > 0 ||
          hrDashboard.pendingVisaDocuments > 0) && (
          <Alert
            message="⚠️ Action Required"
            description={
              <div>
                {hrDashboard.pendingApplications > 0 && (
                  <div 
                    onClick={() => navigate("/hr/hiring_management")}
                    style={{ margin: "4px 0", cursor: "pointer", color: '#1890ff', textDecoration: 'underline' }}
                  >
                    • <strong>{hrDashboard.pendingApplications}</strong>{" "}
                    onboarding application(s) waiting for review (Click to view)
                  </div>
                )}
                {hrDashboard.pendingVisaDocuments > 0 && (
                  <div 
                    onClick={() => navigate("/hr/visaStatus")}
                    style={{ margin: "4px 0", cursor: "pointer", color: '#1890ff', textDecoration: 'underline' }}
                  >
                    • <strong>{hrDashboard.pendingVisaDocuments}</strong> visa
                    document(s) waiting for approval (Click to view)
                  </div>
                )}
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Recent Activity */}
        <div style={{ marginTop: 24 }}>
          <Title level={4}>🕒 Recent Activity</Title>
          <Card style={{ marginTop: 16 }} bodyStyle={{ padding: "0 12px" }}>
            {recentActivities.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item key={item.id} style={{ padding: "16px 8px" }}>
                    <List.Item.Meta
                      avatar={
                        <Tooltip
                          title={
                            item.type === "Application"
                              ? "Onboarding Application"
                              : "Visa Document"
                          }
                        >
                          <Avatar
                            size={48}
                            shape="square"
                            style={{
                              backgroundColor:
                                item.status === "Approved"
                                  ? "#f6ffed"
                                  : "#fff1f0",
                              color:
                                item.status === "Approved"
                                  ? "#52c41a"
                                  : "#ff4d4f",
                              borderRadius: "12px",
                              border: `1px solid ${item.status === "Approved" ? "#b7eb8f" : "#ffa39e"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            icon={
                              item.type === "Application" ? (
                                <FileTextOutlined style={{ fontSize: 24 }} />
                              ) : (
                                <SafetyCertificateOutlined
                                  style={{ fontSize: 24 }}
                                />
                              )
                            }
                          />
                        </Tooltip>
                      }
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <Text
                            strong
                            style={{ fontSize: "16px", lineHeight: "1.2" }}
                          >
                            {item.user}
                          </Text>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "12px",
                              color: "#8c8c8c",
                            }}
                          >
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {item.date.toLocaleDateString()}
                          </div>
                        </div>
                      }
                      description={
                        <div
                          style={{
                            marginTop: 6,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Text>{item.details}</Text>
                          </div>
                          <Tag
                            color={
                              item.status === "Approved" ? "success" : "error"
                            }
                            icon={
                              item.status === "Approved" ? (
                                <CheckCircleOutlined />
                              ) : (
                                <CloseCircleOutlined />
                              )
                            }
                            style={{
                              margin: 0,
                              borderRadius: "6px",
                              padding: "0 8px",
                            }}
                          >
                            {item.status.toUpperCase()}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div
                style={{ textAlign: "center", color: "#999", padding: "32px" }}
              >
                <ClockCircleOutlined
                  style={{
                    fontSize: "24px",
                    marginBottom: "8px",
                    color: "#d9d9d9",
                  }}
                />
                <div>No recent activity found</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  // Render status alert for employees
  const renderStatusAlert = () => {
    if (!applicationStatus || user?.role !== "Employee") return null;

    // Rejected - Show HR feedback
    if (applicationStatus === "Rejected" && feedback) {
      return (
        <Alert
          message="⚠️ Application Rejected"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                <strong>HR Feedback:</strong> {feedback}
              </p>
              <Button
                type="primary"
                danger
                onClick={() => navigate("/onboarding")}
              >
                Revise and Resubmit Application
              </Button>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      );
    }

    // Pending - Waiting for approval
    if (applicationStatus === "Pending") {
      return (
        <Alert
          message="⏳ Application Under Review"
          description="Your onboarding application is currently being reviewed by HR. Please wait for approval."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      );
    }

    // Approved - Check OPT document status
    if (applicationStatus === "Approved") {
      if (!profile) return null;

      const visaType = profile.visaInformation?.visaType || "";
      if (!visaType.startsWith("F1")) {
        return null;
      }

      const optReceiptStatus = profile?.visaDocuments?.optReceipt?.status;
      const optEadStatus = profile?.visaDocuments?.optEad?.status;

      // If OPT Receipt is pending or not uploaded
      if (!optReceiptStatus || optReceiptStatus === "pending") {
        return (
          <Alert
            message="📄 OPT Receipt Pending"
            description={
              <div>
                <p>Waiting for HR to approve your OPT Receipt.</p>
                {!optReceiptStatus && (
                  <Button
                    type="primary"
                    onClick={() => navigate("/visaStatus")}
                  >
                    Upload OPT Receipt
                  </Button>
                )}
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      // If OPT Receipt is approved, prompt for OPT EAD
      if (
        optReceiptStatus === "approved" &&
        (!optEadStatus || optEadStatus === "pending")
      ) {
        return (
          <Alert
            message="✅ OPT Receipt Approved"
            description={
              <div>
                <p>
                  Your OPT Receipt has been approved! Please upload a copy of
                  your OPT EAD.
                </p>
                <Button type="primary" onClick={() => navigate("/visaStatus")}>
                  Upload OPT EAD
                </Button>
              </div>
            }
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      // All documents approved or in review
      if (optEadStatus === "approved") {
        return (
          <Alert
            message="🎉 All Documents Approved"
            description="Your OPT documents have been approved. You're all set!"
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (optEadStatus === "pending") {
        return (
          <Alert
            message="⏳ OPT EAD Under Review"
            description="Your OPT EAD is being reviewed by HR. Please wait for approval."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }
    }

    // Never Submitted
    if (applicationStatus === "Never Submitted") {
      return (
        <Alert
          message="📝 Action Required"
          description={
            <div>
              <p>You haven't submitted your onboarding application yet.</p>
              <Button type="primary" onClick={() => navigate("/onboarding")}>
                Complete Onboarding Application
              </Button>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      );
    }

    return null;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        <Title level={2}>👋 Welcome, {user?.username}!</Title>
        <Paragraph style={{ fontSize: "16px", color: "#666" }}>
          Welcome to the Employee Management System
        </Paragraph>

        {loading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        )}

        {!loading && renderHRDashboard()}
        {!loading && renderStatusAlert()}

        <div style={{ marginTop: 24 }}>
          <Title level={4}>Quick Links:</Title>
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "24px", fontSize: "16px", marginTop: "16px" }}>
            {user?.role === "Employee" && (
              <>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button type="link" onClick={() => navigate("/onboarding")} style={{ padding: 0, height: "auto" }}>
                    📝 Complete Onboarding Application
                  </Button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    type="link"
                    onClick={() => navigate("/personInformation")}
                    disabled={applicationStatus !== "Approved"}
                    title={
                      applicationStatus !== "Approved"
                        ? "Available after onboarding approval"
                        : ""
                    }
                    style={{ padding: 0, height: "auto" }}
                  >
                    👤 View/Update Personal Information
                  </Button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    type="link"
                    onClick={() => navigate("/visaStatus")}
                    disabled={applicationStatus !== "Approved"}
                    title={
                      applicationStatus !== "Approved"
                        ? "Available after onboarding approval"
                        : ""
                    }
                    style={{ padding: 0, height: "auto" }}
                  >
                    📄 Check Visa Status
                  </Button>
                </div>
              </>
            )}

            {user?.role === "HR" && (
              <>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    type="link"
                    onClick={() => navigate("/hr/hiring_management")}
                    style={{ padding: 0, height: "auto" }}
                  >
                    🔑 Hiring Management
                  </Button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    type="link"
                    onClick={() => navigate("/hr/employeeProfiles")}
                    style={{ padding: 0, height: "auto" }}
                  >
                    👥 Employee Profiles
                  </Button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    type="link"
                    onClick={() => navigate("/hr/visaStatus")}
                    style={{ padding: 0, height: "auto" }}
                  >
                    📄 Visa Status Management
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default HomePage;
