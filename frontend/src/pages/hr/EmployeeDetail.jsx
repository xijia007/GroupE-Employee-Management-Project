import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Typography,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Space,
  message,
  Divider,
  Grid,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { Title, Text } = Typography;

function EmployeeDetail() {
  const { id } = useParams(); // Get employee ID from URL
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();

  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    fetchEmployeeDetail();
  }, [id]);

  const fetchEmployeeDetail = async () => {
    try {
      setLoading(true);

      // Fetch onboarding application (contains all employee info)
      const response = await api.get(`/hr/employees/${id}`);
      const { application, user } = response.data;

      // Set employee basic info from user object
      setEmployee({
        _id: id,
        username: user?.username || "N/A",
        email: user?.email || "N/A",
        role: user?.role || "Employee",
        onboardingStatus: application?.status || "Not Started",
      });

      // Set complete application data
      setApplication(application);
    } catch (err) {
      console.error("Error fetching employee detail:", err);
      message.error("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const previewOrDownload = async (
    fileUrl,
    { download = false, filename = "document" } = {},
  ) => {
    try {
      const s = String(fileUrl || "");
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
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = filename;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      message.error(
        download ? "Failed to download file" : "Failed to preview file",
      );
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Loading employee details..." />
      </div>
    );
  }

  if (!employee || !application) {
    return (
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <Card>
          <Text type="secondary">
            Employee not found or application data unavailable.
          </Text>
          <br />
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginTop: 16 }}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const normalizeStatus = (value) =>
    (value || "").replace(/\s+/g, "").toLowerCase();

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "orange", text: "Under Review" },
      approved: { color: "green", text: "Approved" },
      rejected: { color: "red", text: "Rejected" },
      notstarted: { color: "gray", text: "Not Started" },
      neversubmitted: { color: "gray", text: "Not Started" },
    };

    const normalizedStatus = normalizeStatus(status);
    const config = statusConfig[normalizedStatus] || {
      color: "default",
      text: status || "N/A",
    };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const approvedFeedback = "Application approved.";
  const normalizedApplicationStatus = normalizeStatus(application?.status);

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: 12,
        }}
      >
        <Button
          size="small"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/hr/employeeProfiles")}
          style={{ paddingInline: 8 }}
          tabIndex={-1}
        >
          Back to Employee Profiles
        </Button>
      </div>

      {/* Employee Header Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={[16, 12]}>
          <Col xs={24} md={18}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Title
                level={2}
                style={{ margin: 0, fontSize: screens.md ? 24 : 20 }}
              >
                <UserOutlined /> {application.firstName}{" "}
                {application.middleName || ""} {application.lastName}
              </Title>
              <Space
                size={screens.md ? "large" : "small"}
                direction={screens.md ? "horizontal" : "vertical"}
              >
                <Text type="secondary">
                  <MailOutlined /> {application.email || employee.email}
                </Text>
                <Text type="secondary">
                  <PhoneOutlined /> {application.cellPhone || "N/A"}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space
              direction="vertical"
              align={screens.md ? "end" : "center"}
              style={{ width: "100%" }}
            >
              <Text strong>Onboarding Status</Text>
              {getStatusTag(employee.onboardingStatus)}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={12}>
          {/* Personal Information */}
          <Card
            title={
              <>
                <UserOutlined /> Personal Information
              </>
            }
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={screens.md ? 2 : 1} bordered size="small">
              <Descriptions.Item label="First Name">
                {application.firstName}
              </Descriptions.Item>
              <Descriptions.Item label="Middle Name">
                {application.middleName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                {application.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Preferred Name">
                {application.preferredName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {application.dateOfBirth
                  ? new Date(application.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {application.gender || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="SSN">
                {application.ssn
                  ? `XXX-XX-${application.ssn.slice(-4)}`
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Address Information */}
          <Card
            title={
              <>
                <HomeOutlined /> Current Address
              </>
            }
            style={{ marginBottom: 16 }}
          >
            {application.currentAddress ? (
              <Descriptions column={screens.md ? 2 : 1} bordered size="small">
                <Descriptions.Item label="Building/Apt #">
                  {application.currentAddress.building || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Street">
                  {application.currentAddress.street || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="City">
                  {application.currentAddress.city || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {application.currentAddress.state || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Zip Code">
                  {application.currentAddress.zip || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">No address information provided</Text>
            )}
          </Card>

          {/* Contact Information */}
          <Card
            title={
              <>
                <PhoneOutlined /> Contact Information
              </>
            }
          >
            <Descriptions column={screens.md ? 2 : 1} bordered size="small">
              <Descriptions.Item label="Cell Phone">
                {application.cellPhone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Work Phone">
                {application.workPhone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {application.email || employee.email}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={12}>
          {/* Work Authorization */}
          <Card
            title={
              <>
                <SafetyOutlined /> Work Authorization
              </>
            }
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={screens.md ? 2 : 1} bordered size="small">
              <Descriptions.Item label="Status">
                {application.usResident === "greenCard"
                  ? "Green Card"
                  : application.usResident === "usCitizen"
                    ? "US Citizen"
                    : application.visaTitle || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {application.usResident === "workAuth"
                  ? application.visaStartDate
                    ? new Date(application.visaStartDate).toLocaleDateString()
                    : "N/A"
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {application.usResident === "workAuth"
                  ? application.visaEndDate
                    ? new Date(application.visaEndDate).toLocaleDateString()
                    : "N/A"
                  : "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Emergency Contacts */}
          <Card title="🚨 Emergency Contacts" style={{ marginBottom: 16 }}>
            {application.emergencyContacts &&
            application.emergencyContacts.length > 0 ? (
              application.emergencyContacts.map((contact, index) => (
                <div key={index}>
                  {index > 0 && <Divider />}
                  <Descriptions
                    column={screens.md ? 2 : 1}
                    bordered
                    size="small"
                  >
                    <Descriptions.Item label="Name">
                      {contact.firstName} {contact.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Relationship">
                      {contact.relationship || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {contact.phone || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {contact.email || "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ))
            ) : (
              <Text type="secondary">No emergency contacts provided</Text>
            )}
          </Card>

          {/* Documents */}
          <Card title="📄 Uploaded Documents">
            {application.documents &&
            Object.values(application.documents).some((value) => !!value) ? (
              <Descriptions column={screens.md ? 2 : 1} bordered size="small">
                {application.documents.driverLicense && (
                  <Descriptions.Item label="Driver License">
                    <Space>
                      <Button
                        size="small"
                        onClick={() =>
                          previewOrDownload(
                            application.documents.driverLicense,
                            {
                              download: false,
                            },
                          )
                        }
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          previewOrDownload(
                            application.documents.driverLicense,
                            {
                              download: true,
                              filename: "driver-license.pdf",
                            },
                          )
                        }
                      >
                        Download
                      </Button>
                    </Space>
                  </Descriptions.Item>
                )}
                {application.documents.workAuthorization && (
                  <Descriptions.Item label="Work Authorization">
                    <Space>
                      <Button
                        size="small"
                        onClick={() =>
                          previewOrDownload(
                            application.documents.workAuthorization,
                            {
                              download: false,
                            },
                          )
                        }
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          previewOrDownload(
                            application.documents.workAuthorization,
                            {
                              download: true,
                              filename: "work-authorization.pdf",
                            },
                          )
                        }
                      >
                        Download
                      </Button>
                    </Space>
                  </Descriptions.Item>
                )}
                {application.documents.other && (
                  <Descriptions.Item label="Other Document">
                    <Space>
                      <Button
                        size="small"
                        onClick={() =>
                          previewOrDownload(application.documents.other, {
                            download: false,
                          })
                        }
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          previewOrDownload(application.documents.other, {
                            download: true,
                            filename: "other-document.pdf",
                          })
                        }
                      >
                        Download
                      </Button>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Text type="secondary">No Documents Uploaded</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Application Review Info */}
      {normalizedApplicationStatus !== "neversubmitted" &&
        normalizedApplicationStatus !== "notstarted" && (
          <Card
            title="📋 Application Review Information"
            style={{ marginTop: 16 }}
          >
            <Descriptions column={screens.md ? 2 : 1} bordered>
              <Descriptions.Item label="Status">
                {getStatusTag(application.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted At">
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleString()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Reviewed At">
                {application.reviewedAt
                  ? new Date(application.reviewedAt).toLocaleString()
                  : "Not reviewed yet"}
              </Descriptions.Item>
              <Descriptions.Item label="Feedback" span={2}>
                {normalizedApplicationStatus === "approved"
                  ? approvedFeedback
                  : application.feedback || "No feedback provided"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
    </div>
  );
}

export default EmployeeDetail;
