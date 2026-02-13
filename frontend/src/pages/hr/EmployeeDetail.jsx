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
  List,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  SafetyOutlined,
  FileTextOutlined,
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
  const [profile, setProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  useEffect(() => {
    fetchEmployeeDetail();
  }, [id]);

  const fetchEmployeeDetail = async () => {
    try {
      setLoading(true);

      // Fetch onboarding application (contains all employee info)
      const response = await api.get(`/hr/employees/${id}`);
      const { application, user, profile } = response.data;

      setEmployee({
        _id: id,
        username: user?.username || "N/A",
        email: user?.email || "N/A",
        role: user?.role || "Employee",
        onboardingStatus: application?.status || "Not Started",
      });

      // Set complete application data
      console.log("Application Documents:", application?.documents);
      console.log("Profile Visa Documents:", profile?.visaDocuments);
      setProfile(profile);

      // Merge profile data over application data for display
      // If profile exists, it contains the most up-to-date info.
      // If not, fall back to application data.
      let displayData = application;
      
      if (profile) {
          // Check if profile.address is fully populated to avoid overwriting with empty
          // Profile schema ensures address fields are required, so it should be fine.
          displayData = {
            ...application, // Start with application data (preserves status, reviews, etc.)
            ...profile,     // Overwrite with profile data (e.g. email, phone)
            
            // Explicitly map fields where names differ or need deep merge
            firstName: profile.firstName,
            lastName: profile.lastName,
            middleName: profile.middleName,
            preferredName: profile.preferredName,
            email: profile.email,
            ssn: profile.ssn,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            
            // Map Profile 'address' to Application 'currentAddress'
            currentAddress: profile.address, 
            
            // Map Profile 'contactInfo' to Application flat fields if needed or preserve
            // Application schema has 'cellPhone' and 'workPhone' at root.
            cellPhone: profile.contactInfo?.cellPhone,
            workPhone: profile.contactInfo?.workPhone,
            
            // Visa Info
            // Application has 'visaTitle', 'visaStartDate', 'visaEndDate'
            // Profile has 'visaInformation' object
            visaTitle: profile.visaInformation?.visaType,
            visaStartDate: profile.visaInformation?.StartDate,
            visaEndDate: profile.visaInformation?.EndDate,
            
            emergencyContacts: profile.emergencyContacts,
            
            // Documents: Merge them so we see everything
            documents: { 
                ...application.documents, 
                ...profile.documents,
                // Ensure we don't lose specific doc paths if keys match
            },
            
            // Preserve application-specific fields that Profile doesn't have
            status: application.status,
            submittedAt: application.submittedAt,
            reviewedAt: application.reviewedAt,
            feedback: application.feedback,
            usResident: application.usResident
          };
      }
      
      setApplication(displayData);
    } catch (err) {
      console.error("Error fetching employee detail:", err);
      message.error("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const loadProfilePicture = async () => {
      const raw = String(application?.profile_picture || "").trim();
      if (!raw) {
        setProfilePictureUrl(null);
        return;
      }

      try {
        if (raw.includes("/api/")) {
          const apiPath = raw.startsWith("/api/") ? raw.slice(4) : raw;
          const res = await api.get(apiPath, { responseType: "blob" });
          if (cancelled) return;
          objectUrl = URL.createObjectURL(res.data);
          setProfilePictureUrl(objectUrl);
          return;
        }
        setProfilePictureUrl(raw);
      } catch {
        setProfilePictureUrl(null);
      }
    };

    loadProfilePicture();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [application?.profile_picture]);

  const previewOrDownload = async (
    fileUrl,
    { download = false, filename = "document" } = {},
  ) => {
    try {
      const s = String(fileUrl || "");
      if (s.includes("/api/")) {
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
    } catch {
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

  const getOverallStatusTag = () => {
    // 1. Get base onboarding status
    const appStatus = normalizeStatus(application?.status || employee?.onboardingStatus);
    
    if (appStatus === 'pending') return <Tag color="blue">Application Pending</Tag>;
    if (appStatus === 'rejected') return <Tag color="red">Rejected</Tag>;
    if (appStatus === 'notstarted' || appStatus === 'neversubmitted') return <Tag color="default">Not Started</Tag>;

    if (appStatus === 'approved') {
        const visaType = profile?.visaInformation?.visaType || application?.visaTitle;
        const usResident = application?.usResident;
        
        const isCitizen = 
            visaType === 'US Citizen' || 
            visaType === 'Green Card' || 
            usResident === 'usCitizen' || 
            usResident === 'greenCard';
        
        if (isCitizen) {
            return <Tag color="green">Approved</Tag>;
        }

        // Check for F1 visa documents status
        const isF1 = visaType && String(visaType).startsWith('F1');
        if (isF1) {
            const docs = profile?.visaDocuments || {};
            const allApproved = 
                docs.optReceipt?.status === 'approved' &&
                docs.optEad?.status === 'approved' &&
                docs.i983?.status === 'approved' &&
                docs.i20?.status === 'approved';
            
            if (allApproved) {
                return <Tag color="green">Approved</Tag>;
            }
            // F1 status not complete
            return <Tag color="orange">Visa Review</Tag>;
        }

        // For other visa types (H1-B, L2, H4, Other), onboarding approval is sufficient
        return <Tag color="green">Approved</Tag>;
    }
    
    return <Tag>Unknown</Tag>;
  };

  const getApplicationStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "blue", text: "Pending Review" },
      approved: { color: "green", text: "Approved" },
      rejected: { color: "red", text: "Rejected" },
      notstarted: { color: "default", text: "Not Started" },
      neversubmitted: { color: "default", text: "Not Started" },
    };
    const ns = normalizeStatus(status);
    const conf = statusConfig[ns] || { color: "default", text: status || "N/A" };
    return <Tag color={conf.color}>{conf.text}</Tag>;
  };

  const approvedFeedback = "Application approved.";
  const normalizedApplicationStatus = normalizeStatus(application?.status);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
        textAlign: "left",
        lineHeight: "1.5",
      }}
    >
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
          <Col xs={24} md={3} style={{ display: "flex", justifyContent: screens.md ? "flex-start" : "center" }}>
            <Avatar
              size={88}
              src={profilePictureUrl || undefined}
              icon={!profilePictureUrl ? <UserOutlined /> : undefined}
              style={
                profilePictureUrl
                  ? { border: "2px solid #f0f0f0" }
                  : {
                      background:
                        "linear-gradient(135deg, #1677ff 0%, #6ea8fe 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 24,
                    }
              }
            />
          </Col>
          <Col xs={24} md={15}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Title
                level={2}
                style={{ margin: 0, fontSize: screens.md ? 24 : 20 }}
              >
                {application.firstName}{" "}
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
              {getOverallStatusTag()}
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
            <Descriptions
              column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
              bordered
              size="small"
              layout="vertical"
              labelStyle={{ fontWeight: "bold", width: "100%" }}
              contentStyle={{ width: "100%" }}
            >
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
              <Descriptions
                column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
                bordered
                size="small"
                layout="vertical"
                labelStyle={{ fontWeight: "bold", width: "100%" }}
                contentStyle={{ width: "100%" }}
              >
                <Descriptions.Item label="Building/Apt #">
                  {application.currentAddress.building || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Street" span={2}>
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
            <Descriptions
              column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
              bordered
              size="small"
              layout="vertical"
              labelStyle={{ fontWeight: "bold", width: "100%" }}
              contentStyle={{ width: "100%" }}
            >
              <Descriptions.Item label="Cell Phone">
                {application.cellPhone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Work Phone">
                {application.workPhone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
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
            <Descriptions
              column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
              bordered
              size="small"
              layout="vertical"
              labelStyle={{ fontWeight: "bold", width: "100%" }}
              contentStyle={{ width: "100%" }}
            >
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
                    column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
                    bordered
                    size="small"
                    layout="vertical"
                    labelStyle={{ fontWeight: "bold", width: "100%" }}
                    contentStyle={{ width: "100%" }}
                  >
                    <Descriptions.Item label="Name" span={2}>
                      {contact.firstName} {contact.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Relationship">
                      {contact.relationship || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {contact.phone || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email" span={2}>
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
          <Card
            title={
              <>
                <FileTextOutlined /> Uploaded Documents
              </>
            }
          >
            {/* Onboarding Documents */}
            <Title level={5} style={{ marginTop: 0 }}>
              Onboarding Documents
            </Title>
            {application.documents &&
            Object.values(application.documents).some((value) => !!value) ? (
              <List
                size="small"
                bordered
                dataSource={[
                  {
                    name: "Driver License",
                    url: application.documents.driverLicense,
                  },
                  {
                    name: "Work Authorization",
                    url: application.documents.workAuthorization,
                  },
                  { name: "Other Document", url: application.documents.other },
                ].filter((doc) => !!doc.url)}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          previewOrDownload(item.url);
                        }}
                        style={{ fontWeight: "bold" }}
                      >
                        View
                      </a>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <FileTextOutlined
                          style={{ fontSize: "20px", color: "#1890ff" }}
                        />
                      }
                      title={item.name}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
              >
                No onboarding documents uploaded.
              </Text>
            )}

            {/* Visa Documents */}
            {profile?.visaDocuments && (
              <>
                <Title level={5} style={{ marginTop: 24 }}>
                  Visa Documents
                </Title>
                <List
                  size="small"
                  bordered
                  dataSource={[
                    {
                      name: "OPT Receipt",
                      doc: profile.visaDocuments.optReceipt,
                      url: profile.documents?.optReceipt,
                    },
                    {
                      name: "OPT EAD",
                      doc: profile.visaDocuments.optEad,
                      url: profile.documents?.optEad,
                    },
                    {
                      name: "I-983",
                      doc: profile.visaDocuments.i983,
                      url: profile.documents?.i983,
                    },
                    {
                      name: "I-20",
                      doc: profile.visaDocuments.i20,
                      url: profile.documents?.i20,
                    },
                  ].filter((item) => item.url)} // Only show if URL exists
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Tag
                          color={
                            item.doc?.status === "approved"
                              ? "success"
                              : item.doc?.status === "rejected"
                                ? "error"
                                : item.doc?.status === "pending"
                                  ? "processing"
                                  : item.doc?.status === "Not Uploaded"
                                    ? "default"
                                    : "default"
                          }
                        >
                          {item.doc?.status
                            ? item.doc.status.toUpperCase()
                            : "N/A"}
                        </Tag>,
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            previewOrDownload(item.url);
                          }}
                          style={{ fontWeight: "bold" }}
                        >
                          View
                        </a>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <SafetyOutlined
                            style={{ fontSize: "20px", color: "#52c41a" }}
                          />
                        }
                        title={item.name}
                      />
                    </List.Item>
                  )}
                />
                {[
                  profile.documents?.optReceipt,
                  profile.documents?.optEad,
                  profile.documents?.i983,
                  profile.documents?.i20,
                ].every((url) => !url) && (
                  <Text type="secondary">No visa documents uploaded.</Text>
                )}
              </>
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
            <Descriptions
              column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
              bordered
              layout="vertical"
              labelStyle={{ fontWeight: "bold", width: "100%" }}
              contentStyle={{ width: "100%" }}
            >
              <Descriptions.Item label="Status">
                {getApplicationStatusTag(application.status)}
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
              <Descriptions.Item label="Feedback" span={3}>
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
