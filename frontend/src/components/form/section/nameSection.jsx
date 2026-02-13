import {
  Row,
  Col,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Upload,
  message,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import SectionButton from "./SectionButton";
import api from "../../../services/api";

const config = {
  rules: [{ type: "object", required: true, message: "Please select time!" }],
};

export default function NameSection({ sectionButtonProps }) {
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get the current profile_picture value from the form
  const profilePicture = Form.useWatch("profile_picture");

  // Load existing profile picture via authenticated request
  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const load = async () => {
      const raw = String(profilePicture || "").trim();
      if (!raw) {
        setProfilePicUrl(null);
        return;
      }

      try {
        if (raw.includes("/api/files/")) {
          const apiPath = raw.startsWith("/api/") ? raw.slice(4) : raw;
          const res = await api.get(apiPath, { responseType: "blob" });
          if (cancelled) return;
          objectUrl = URL.createObjectURL(res.data);
          setProfilePicUrl(objectUrl);
          return;
        }
        // Public / legacy URL — use directly
        setProfilePicUrl(raw);
      } catch {
        setProfilePicUrl(null);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [profilePicture]);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }
    return false; // Prevent auto-upload; we handle it manually
  };

  const handleFileChange = (info) => {
    setFileList(info.fileList.slice(-1)); // Keep only the latest file
  };

  const handleUpload = async () => {
    if (!fileList.length || !fileList[0].originFileObj) {
      message.warning("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj);

    setUploading(true);
    try {
      const res = await api.post("/info/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Profile picture uploaded successfully!");
      setFileList([]); // Clear upload list
      // The profilePicture watch will pick up new value from form
      // We need to find the form instance and update it
      // But since profile_picture is stored on the form, we can't directly update it here
      // Instead, return the path so the parent can handle it
      // Actually, we can just reload the page or refetch
      // For now, just set the blob URL directly
      if (res.data?.path) {
        // Fetch the new picture blob
        const apiPath = res.data.path.startsWith("/api/")
          ? res.data.path.slice(4)
          : res.data.path;
        const blobRes = await api.get(apiPath, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(blobRes.data);
        setProfilePicUrl(blobUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
      message.error(
        err?.response?.data?.message || "Failed to upload profile picture",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card
      title="Name Section"
      variant="borderless"
      style={{ marginBottom: 24 }}
    >
      <Form.Item label="Name" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: "First name is required" }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="First Name" disabled={!isEditing} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="middleName" style={{ marginBottom: 0 }}>
              <Input placeholder="Middle Name" disabled={!isEditing} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="lastName"
              rules={[{ required: true, message: "Last name is required" }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Last Name" disabled={!isEditing} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item name="preferredName" label="Preferred Name">
        <Row gutter={16}>
          <Col span={8}>
            <Input placeholder="Preferred Name" disabled={!isEditing} />
          </Col>
        </Row>
      </Form.Item>

      {/* Hidden field to keep profile_picture value in form state */}
      <Form.Item name="profile_picture" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="Profile Picture">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
          {/* Current picture preview */}
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt="Current profile"
              style={{
                width: 120,
                height: 120,
                borderRadius: 8,
                objectFit: "cover",
                border: "1px solid #f0f0f0",
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                border: "1px dashed #d9d9d9",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#bfbfbf",
                background:
                  "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <UserOutlined style={{ fontSize: 40, color: "#bfbfbf" }} />
              <span style={{ fontSize: 11, color: "#999" }}>No Photo</span>
            </div>
          )}

          {/* Upload controls (only visible when editing) */}
          {isEditing && (
            <div>
              <Upload
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={handleFileChange}
                maxCount={1}
                listType="picture"
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Select Picture</Button>
              </Upload>
              {fileList.length > 0 && (
                <Button
                  type="primary"
                  onClick={handleUpload}
                  loading={uploading}
                  style={{ marginTop: 8 }}
                >
                  Upload
                </Button>
              )}
            </div>
          )}
        </div>
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Email is required" },
          { type: "email", message: "Please enter a valid email" },
        ]}
      >
        <Input disabled={!isEditing} />
      </Form.Item>

      <Form.Item label="Social Security Number">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="ssn"
              rules={[
                { required: true, message: "SSN is required" },
                {
                  pattern: /^\d{3}-\d{2}-\d{4}$/,
                  message: "Format: XXX-XX-XXXX",
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="XXX-XX-XXXX" disabled={!isEditing} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label="Date of Birth" {...config}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="dateOfBirth" noStyle rules={config.rules}>
              <DatePicker style={{ width: "100%" }} disabled={!isEditing} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item label="Gender">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="gender"
              noStyle
              rules={[{ required: true, message: "Gender is required" }]}
            >
              <Select
                disabled={!isEditing}
                options={[
                  { label: "Female", value: "Female" },
                  { label: "Male", value: "Male" },
                  {
                    label: "I do not wish to answer",
                    value: "I do not wish to answer",
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <SectionButton {...sectionButtonProps} onEditingChange={setIsEditing} />
    </Card>
  );
}
