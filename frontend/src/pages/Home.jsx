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

      const docs = profile?.documents || {};
      const visaDocs = profile?.visaDocuments || {};

      const normalizeDocStatus = (key) => {
        const hasFile = Boolean(docs?.[key]);
        const raw = visaDocs?.[key]?.status;
        if (!hasFile) return "Not Uploaded";

        const normalized = String(raw || "").toLowerCase();
        if (
          !raw ||
          normalized === "locked" ||
          normalized === "not uploaded"
        ) {
          return "pending";
        }
        return raw;
      };

      const optReceiptStatus = normalizeDocStatus("optReceipt");
      const optEadStatus = normalizeDocStatus("optEad");
      const i983Status = normalizeDocStatus("i983");
      const i20Status = normalizeDocStatus("i20");

      if (optReceiptStatus === "Not Uploaded") {
        return (
          <Alert
            message="📄 Action Required"
            description={
              <div>
                <p>Please upload your OPT Receipt.</p>
                <Button type="primary" onClick={() => navigate("/visaStatus")}>
                  Upload OPT Receipt
                </Button>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (optReceiptStatus === "pending") {
        return (
          <Alert
            message="📄 OPT Receipt Pending"
            description={
              <div>
                <p>Waiting for HR to approve your OPT Receipt.</p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (optReceiptStatus === "rejected") {
        return (
          <Alert
            message="❌ OPT Receipt Rejected"
            description={
              <div>
                <p>{visaDocs?.optReceipt?.feedback || "Please review HR feedback and re-upload."}</p>
                <Button type="primary" onClick={() => navigate("/visaStatus")}>
                  Go to Visa Status
                </Button>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (optEadStatus === "Not Uploaded") {
        return (
          <Alert
            message="✅ OPT Receipt Approved"
            description={
              <div>
                <p>Your OPT Receipt has been approved. Please upload your OPT EAD.</p>
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

      if (optEadStatus === "rejected") {
        return (
          <Alert
            message="❌ OPT EAD Rejected"
            description={
              <div>
                <p>{visaDocs?.optEad?.feedback || "Please review HR feedback and re-upload."}</p>
                <Button type="primary" onClick={() => navigate("/visaStatus")}>
                  Go to Visa Status
                </Button>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (i983Status === "Not Uploaded") {
        return (
          <Alert
            message="📝 Next Step: I-983"
            description={
              <div>
                <p>Your OPT EAD has been approved. Please upload your I-983.</p>
                <Button type="primary" onClick={() => navigate("/visaStatus")}>
                  Upload I-983
                </Button>
              </div>
            }
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (i983Status === "pending") {
        return (
          <Alert
            message="⏳ I-983 Under Review"
            description="Your I-983 is being reviewed by HR. Please wait for approval."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (i983Status === "rejected") {
        return (
          <Alert
            message="❌ I-983 Rejected"
            description={
              <div>
                <p>{visaDocs?.i983?.feedback || "Please review HR feedback and re-upload."}</p>
                <Button type="primary" onClick={() => navigate("/visaStatus")}>
                  Go to Visa Status
                </Button>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (i20Status === "Not Uploaded") {
        return (
          <Alert
            message="📝 Next Step: I-20"
            description={
              <div>
                <p>Your I-983 has been approved. Please upload your I-20.</p>
                <Button type="primary" onClick={() => navigate("/visaStatus")}>
                  Upload I-20
                </Button>
              </div>
            }
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (i20Status === "pending") {
        return (
          <Alert
            message="⏳ I-20 Under Review"
            description="Your I-20 is being reviewed by HR. Please wait for approval."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (i20Status === "rejected") {
        return (
          <Alert
            message="❌ I-20 Rejected"
            description={
              <div>
                <p>{visaDocs?.i20?.feedback || "Please review HR feedback and re-upload."}</p>
                <Button type="primary" onClick={() => navigate("/visaStatus")}>
                  Go to Visa Status
                </Button>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (
        optReceiptStatus === "approved" &&
        optEadStatus === "approved" &&
        i983Status === "approved" &&
        i20Status === "approved"
      ) {
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
      <Card style={{ marginBottom: "50px"}}>
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
      </Card>   

      <Card>
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
