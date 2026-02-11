import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Tag,
  message,
  Input,
  Space,
  Spin,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { TextArea } = Input;

function ApplicationReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hr/onboarding-applications/${id}`);
      setApplication(response.data.application);
    } catch (err) {
      console.error("Error fetching application:", err);
      message.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/hr/onboarding-applications/${id}/review`, {
        status: "Approved",
        feedback: feedback || "Your application has been approved!",
      });

      message.success("Application approved successfully!");
      navigate("/hr/hiring_management");
    } catch (err) {
      console.error("Error approving application:", err);
      message.error("Failed to approve application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      message.warning("Please provide feedback for rejection");
      return;
    }

    try {
      setSubmitting(true);
      await api.patch(`/hr/onboarding-applications/${id}/review`, {
        status: "Rejected",
        feedback: feedback,
      });

      message.success("Application rejected. Employee will be notified.");
      navigate("/hr/hiring_management");
    } catch (err) {
      console.error("Error rejecting application", err);
      message.error("Failed to reject application.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewOrDownload = async (
    fileUrl,
    { download = false, filename = "document" } = {},
  ) => {
    try {
      const s = String(fileUrl || "");

      // Secured DB file: /api/files/<id>/...
      if (s.includes("/api/files/")) {
        const apiPath = s.startsWith("/api/") ? s.slice(4) : s;
        const res = await api.get(apiPath + (download ? "?download=1" : ""), {
          responseType: "blob",
        });
        const blobUrl = URL.createObjectURL(res.data);

        if (download) {
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
        } else {
          window.open(blobUrl, "_blank", "noopener,noreferrer");
        }

        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        return;
      }

      // Legacy/public file
      if (download) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      message.error(
        download ? "Failed to download file" : "Failed to preview file",
      );
    }
  };

  const handlePreview = (fileUrl) =>
    previewOrDownload(fileUrl, { download: false });
  const handleDownload = (fileUrl, fileName) =>
    previewOrDownload(fileUrl, { download: true, filename: fileName });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading application details...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div>
        <h2>Application not found</h2>
        <Button onClick={() => navigate("/hr/hiring_management")}>
          Back to Hiring Management
        </Button>
      </div>
    );
  }

  const normalizeStatus = (value) =>
    (value || "").replace(/\s+/g, "").toLowerCase();

  const statusConfig = {
    pending: { color: "orange", text: "Under Review" },
    approved: { color: "green", text: "Approved" },
    rejected: { color: "red", text: "Rejected" },
    notstarted: { color: "gray", text: "Not Started" },
    neversubmitted: { color: "gray", text: "Not Started" },
  };
  const approvedFeedback = "Application approved.";

  const normalizedStatus = normalizeStatus(application.status);
  const statusDisplay =
    statusConfig[normalizedStatus]?.text || application.status || "N/A";
  const statusColor = statusConfig[normalizedStatus]?.color || "default";

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/hr/hiring_management")}
        style={{ marginBottom: 16 }}
      >
        Back to List
      </Button>

      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Application Details</span>
            <Tag color={statusColor}>{statusDisplay}</Tag>
          </div>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Full Name" span={2}>
            {application.firstName} {application.middleName}{" "}
            {application.lastName}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {application.email}
          </Descriptions.Item>

          <Descriptions.Item label="Cell Phone">
            {application.cellPhone}
          </Descriptions.Item>

          <Descriptions.Item label="Date of Birth">
            {application.dateOfBirth
              ? new Date(application.dateOfBirth).toLocaleDateString()
              : "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Gender">
            {application.gender}
          </Descriptions.Item>

          <Descriptions.Item label="SSN" span={2}>
            {application.ssn}
          </Descriptions.Item>

          <Descriptions.Item label="Address" span={2}>
            {application.currentAddress ? (
              <>
                {application.currentAddress.building},{" "}
                {application.currentAddress.street}
                <br />
                {application.currentAddress.city},{" "}
                {application.currentAddress.state},{" "}
                {application.currentAddress.zip}
              </>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>

          <Descriptions.Item label="US Resident Status" span={2}>
            {application.usResident === "usCitizen"
              ? "US Citizen"
              : application.usResident === "greenCard"
                ? "Green Card Holder"
                : "Work Authorization (Visa)"}
          </Descriptions.Item>

          {application.usResident === "workAuth" && (
            <>
              <Descriptions.Item label="Visa Type">
                {application.visaTitle}
              </Descriptions.Item>
              <Descriptions.Item label="Visa Validity">
                {application.visaStartDate
                  ? new Date(application.visaStartDate).toLocaleDateString()
                  : "N/A"}
                {" - "}
                {application.visaEndDate
                  ? new Date(application.visaEndDate).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>
            </>
          )}

          <Descriptions.Item label="Emergency Contacts" span={2}>
            {application.emergencyContacts &&
            application.emergencyContacts.length > 0
              ? application.emergencyContacts.map((contact, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <strong>
                      {contact.firstName} {contact.lastName}
                    </strong>{" "}
                    ({contact.relationship})<br />
                    Phone: {contact.phone} | Email: {contact.email}
                  </div>
                ))
              : "None"}
          </Descriptions.Item>

          <Descriptions.Item label="Submitted At">
            {application.submittedAt
              ? new Date(application.submittedAt).toLocaleString()
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>

        {/* Uploaded Documents Section */}
        <Card
          type="inner"
          title="📎 Uploaded Documents"
          style={{ marginTop: 24 }}
        >
          {application.documents &&
          Object.keys(application.documents).some(
            (key) => application.documents[key],
          ) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {application.profile_picture && (
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <strong>Profile Picture:</strong>
                    <Image
                      src={application.profile_picture}
                      alt="Profile"
                      width={80}
                      height={80}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                  </div>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      handleDownload(
                        application.profile_picture,
                        "profile-picture.jpg",
                      )
                    }
                  >
                    Download
                  </Button>
                </div>
              )}

              {application.documents.driverLicense && (
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
                    {application.documents.driverLicense.split("/").pop()}
                  </span>
                  <div>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() =>
                        handlePreview(application.documents.driverLicense)
                      }
                      style={{ marginRight: 8 }}
                    >
                      Preview
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        handleDownload(
                          application.documents.driverLicense,
                          "driver-license.pdf",
                        )
                      }
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {application.documents.workAuthorization && (
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
                    {application.documents.workAuthorization.split("/").pop()}
                  </span>
                  <div>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() =>
                        handlePreview(application.documents.workAuthorization)
                      }
                      style={{ marginRight: 8 }}
                    >
                      Preview
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        handleDownload(
                          application.documents.workAuthorization,
                          "work-authorization.pdf",
                        )
                      }
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {application.documents.other && (
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
                    <strong>Other Document:</strong>{" "}
                    {application.documents.other.split("/").pop()}
                  </span>
                  <div>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(application.documents.other)}
                      style={{ marginRight: 8 }}
                    >
                      Preview
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        handleDownload(
                          application.documents.other,
                          "other-document.pdf",
                        )
                      }
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "#999", textAlign: "center" }}>
              No documents uploaded
            </p>
          )}
        </Card>

        {/* 审批操作区域 */}
        {normalizedStatus === "pending" && !actionType && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Space size="large">
              <Button
                danger
                size="large"
                icon={<CloseOutlined />}
                onClick={() => setActionType("reject")}
              >
                Reject Application
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={() => setActionType("approve")}
              >
                Approve Application
              </Button>
            </Space>
          </div>
        )}
        {/* 审批表单 */}
        {actionType && (
          <Card
            style={{ marginTop: 24, backgroundColor: "#f9f9f9" }}
            title={
              actionType === "approve"
                ? "✅ Approve Application"
                : "❌ Reject Application"
            }
          >
            <TextArea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                actionType === "approve"
                  ? "Optional: Add a welcome message"
                  : "Required: Provide feedback for rejection"
              }
              style={{ marginBottom: 16 }}
            />
            <Space>
              <Button
                onClick={() => {
                  setActionType(null);
                  setFeedback("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger={actionType === "reject"}
                loading={submitting}
                onClick={
                  actionType === "approve" ? handleApprove : handleReject
                }
              >
                Confirm {actionType === "approve" ? "Approval" : "Rejection"}
              </Button>
            </Space>
          </Card>
        )}
        {/* 已审批状态显示 */}
        {normalizedStatus !== "pending" && (
          <Card style={{ marginTop: 24, backgroundColor: "#f0f0f0" }}>
            <p>
              <strong>Status:</strong> {statusDisplay}
            </p>
            {(application.feedback || normalizedStatus === "approved") && (
              <p>
                <strong>Feedback:</strong>{" "}
                {normalizedStatus === "approved"
                  ? approvedFeedback
                  : application.feedback}
              </p>
            )}
            {application.reviewedAt && (
              <p>
                <strong>Reviewed At:</strong>{" "}
                {new Date(application.reviewedAt).toLocaleString()}
              </p>
            )}
          </Card>
        )}
      </Card>
    </div>
  );
}

export default ApplicationReview;
