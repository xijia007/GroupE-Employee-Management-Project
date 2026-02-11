import React, { useState, useEffect } from "react";
import OnboardingForm from "../components/form/onboarding_form.jsx";
import {
  Steps,
  Card,
  Spin,
  message,
  Descriptions,
  Button,
  Tag,
  Image,
} from "antd";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import api from "../services/api";
import dayjs from "dayjs";

const statusSteps = [
  {
    title: "Never Submitted",
    description: "Please fill out and submit your onboarding application.",
  },
  {
    title: "Pending",
    description: "Your application is being reviewed by HR.",
  },
  {
    title: "Approved",
    description: "Your application has been approved! Welcome aboard!",
  },
  {
    title: "Rejected",
    description:
      "Your application needs revisions. Please update and resubmit.",
  },
];

const statusToStep = {
  "Never Submitted": 0,
  Pending: 1,
  Approved: 2,
  Rejected: 3,
};

function OnboardingApplication() {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState("Never Submitted");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const statusResponse = await api.get("/onboarding/status");
        setApplicationStatus(statusResponse.data.status);
        setFeedback(statusResponse.data.feedback || "");

        if (statusResponse.data.status !== "Never Submitted") {
          const appResponse = await api.get("/onboarding/my-application");
          setApplicationData(appResponse.data.application);
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        message.error("Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplication();
    }
  }, [user]);

  const handleSubmit = async (formData) => {
    try {
      const response = await api.post("/onboarding/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setApplicationStatus("Pending");
      setApplicationData(response.data.application);

      message.success("Application submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      message.error("Failed to submit application. Please try again.");
      throw error;
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const doDownload = async () => {
      try {
        // If it's a secured API file (/api/files/...), fetch blob with Authorization
        const s = String(fileUrl || "");
        if (s.includes("/api/files/")) {
          const apiPath = s.startsWith("/api/") ? s.slice(4) : s;
          const res = await api.get(apiPath, { responseType: "blob" });
          const blobUrl = URL.createObjectURL(res.data);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
          return;
        }

        // Legacy/public file
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        message.error("Failed to download file");
      }
    };

    doDownload();
  };

  const handlePreview = (fileUrl) => {
    const doPreview = async () => {
      try {
        const s = String(fileUrl || "");
        if (s.includes("/api/files/")) {
          const apiPath = s.startsWith("/api/") ? s.slice(4) : s;
          const res = await api.get(apiPath, { responseType: "blob" });
          const blobUrl = URL.createObjectURL(res.data);
          window.open(blobUrl, "_blank", "noopener,noreferrer");
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
          return;
        }
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } catch (e) {
        message.error("Failed to preview file");
      }
    };

    doPreview();
  };

  const renderApplicationDetails = () => {
    if (!applicationData) return null;

    const formatDate = (date) =>
      date ? dayjs(date).format("YYYY-MM-DD") : "N/A";

    return (
      <Card title="📄 Your Submitted Application" style={{ marginBottom: 24 }}>
        <Descriptions 
            bordered 
            layout="vertical"
            labelStyle={{ textAlign: 'left', fontWeight: 'bold' }}
            contentStyle={{ textAlign: 'left' }}
        >
          <Descriptions.Item label="First Name">
            {applicationData.firstName}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {applicationData.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Middle Name">
            {applicationData.middleName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Preferred Name">
            {applicationData.preferredName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {applicationData.email}
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {formatDate(applicationData.dateOfBirth)}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {applicationData.gender}
          </Descriptions.Item>
          <Descriptions.Item label="Cell Phone">
            {applicationData.cellPhone}
          </Descriptions.Item>
          <Descriptions.Item label="Work Phone">
            {applicationData.workPhone || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Address" span={2}>
            {applicationData.currentAddress
              ? `${applicationData.currentAddress.building || ""}, ${applicationData.currentAddress.street || ""}, ${applicationData.currentAddress.city || ""}, ${applicationData.currentAddress.state || ""} ${applicationData.currentAddress.zip || ""}`
              : "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="US Resident Status" span={2}>
            {applicationData.usResident === "usCitizen"
              ? "US Citizen"
              : applicationData.usResident === "greenCard"
                ? "Green Card Holder"
                : "Work Authorization Required"}
          </Descriptions.Item>

          {applicationData.usResident === "workAuth" && (
            <>
              <Descriptions.Item label="Visa Type">
                {applicationData.visaTitle}
              </Descriptions.Item>
              <Descriptions.Item label="Visa Period">
                {formatDate(applicationData.visaStartDate)} to{" "}
                {formatDate(applicationData.visaEndDate)}
              </Descriptions.Item>
            </>
          )}

          <Descriptions.Item label="Submitted At" span={2}>
            {formatDate(applicationData.submittedAt)}
          </Descriptions.Item>
        </Descriptions>

        {/* Documents Section */}
        <Card
          type="inner"
          title="📎 Uploaded Documents"
          style={{ marginTop: 24 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {applicationData.documents?.driverLicense && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                }}
              >
                <span>
                  <strong>Driver's License:</strong>{" "}
                  {applicationData.documents.driverLicense.split("/").pop()}
                </span>
                <div>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handlePreview(applicationData.documents.driverLicense)
                    }
                    style={{ marginRight: 8 }}
                  >
                    Preview
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      handleDownload(
                        applicationData.documents.driverLicense,
                        "driver-license.pdf",
                      )
                    }
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}

            {applicationData.documents?.workAuthorization && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                }}
              >
                <span>
                  <strong>Work Authorization:</strong>{" "}
                  {applicationData.documents.workAuthorization.split("/").pop()}
                </span>
                <div>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handlePreview(applicationData.documents.workAuthorization)
                    }
                    style={{ marginRight: 8 }}
                  >
                    Preview
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      handleDownload(
                        applicationData.documents.workAuthorization,
                        "work-authorization.pdf",
                      )
                    }
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}

            {applicationData.profile_picture && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                }}
              >
                <span>
                  <strong>Profile Picture:</strong>
                </span>
                <Image
                  src={applicationData.profile_picture}
                  alt="Profile"
                  width={100}
                  preview={{
                    mask: <EyeOutlined />,
                  }}
                />
              </div>
            )}

            {!applicationData.documents?.driverLicense &&
              !applicationData.documents?.workAuthorization &&
              !applicationData.profile_picture && (
                <p style={{ color: "#999", textAlign: "center" }}>
                  No documents uploaded
                </p>
              )}
          </div>
        </Card>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading...</div>
      </div>
    );
  }

  const currentStep = statusToStep[applicationStatus] || 0;
  const isRejected = applicationStatus === "Rejected";

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Card style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          status={isRejected ? "error" : "process"}
          items={statusSteps}
        />
      </Card>

      {isRejected && feedback && (
        <Card
          type="inner"
          title="⚠️ Feedback from HR"
          style={{ marginBottom: 24, borderColor: "#ff4d4f" }}
        >
          <p style={{ color: "#ff4d4f", fontSize: 16 }}>{feedback}</p>
          <p>
            Please revise your application according to the feedback above and
            resubmit.
          </p>
        </Card>
      )}

      {applicationStatus === "Approved" && (
        <Card
          type="inner"
          title="🎉 Congratulations!"
          style={{
            marginBottom: 24,
            borderColor: "#52c41a",
            background: "#f6ffed",
          }}
        >
          <p style={{ color: "#52c41a", fontSize: 16 }}>
            Your onboarding application has been approved! Welcome to the team!
          </p>
        </Card>
      )}

      {applicationStatus === "Pending" && (
        <Card
          type="inner"
          title="⏳ Under Review"
          style={{
            marginBottom: 24,
            borderColor: "#1890ff",
            background: "#e6f7ff",
          }}
        >
          <p style={{ color: "#1890ff", fontSize: 16 }}>
            Your application is currently being reviewed by HR. Please wait for
            approval.
          </p>
        </Card>
      )}

      {(applicationStatus === "Never Submitted" || isRejected) && (
        <Card
          title={
            isRejected ? "📝 Resubmit Application" : "📝 Onboarding Application"
          }
        >
          <OnboardingForm
            initialData={applicationData}
            onSubmit={handleSubmit}
            isResubmission={isRejected}
          />
        </Card>
      )}

      {(applicationStatus === "Approved" || applicationStatus === "Pending") &&
        renderApplicationDetails()}
    </div>
  );
}

export default OnboardingApplication;
