import {
  Row,
  Col,
  Form,
  Input,
  Card,
  Space,
  Upload,
  Button,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import SectionButton from "./SectionButton";
import api from "../../../services/api";

export default function UploadDocument({ sectionButtonProps }) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState({
    driverLicense: false,
    workAuthorization: false,
    other: false,
  });

  const form = Form.useFormInstance();

  const beforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("File must be smaller than 5MB!");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const uploadDoc = (docType) => async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      setUploading((prev) => ({ ...prev, [docType]: true }));
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        `/info/profile/documents/${docType}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const path = res?.data?.path;
      if (path) {
        const currentDocs = form.getFieldValue(["documents"]) || {};
        form.setFieldsValue({
          documents: {
            ...currentDocs,
            [docType]: path,
          },
        });
      }

      message.success("Uploaded successfully");
      onSuccess?.(res.data);
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      message.error(backendMessage || "Upload failed");
      onError?.(err);
    } finally {
      setUploading((prev) => ({ ...prev, [docType]: false }));
    }
  };

  return (
    <Card title="Documents" variant="borderless" style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Form.Item
            label="Driver License"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Space orientation="vertical" style={{ width: "100%" }} size={8}>
              <Form.Item name={["documents", "driverLicense"]} noStyle>
                <Input placeholder="Driver License URL" disabled={!isEditing} />
              </Form.Item>
              <Upload
                showUploadList={false}
                maxCount={1}
                beforeUpload={beforeUpload}
                customRequest={uploadDoc("driverLicense")}
                disabled={!isEditing}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading.driverLicense}
                  disabled={!isEditing}
                >
                  Upload / Re-upload
                </Button>
              </Upload>
            </Space>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Work Authorization"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Space orientation="vertical" style={{ width: "100%" }} size={8}>
              <Form.Item name={["documents", "workAuthorization"]} noStyle>
                <Input
                  placeholder="Work Authorization URL"
                  disabled={!isEditing}
                />
              </Form.Item>
              <Upload
                showUploadList={false}
                maxCount={1}
                beforeUpload={beforeUpload}
                customRequest={uploadDoc("workAuthorization")}
                disabled={!isEditing}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading.workAuthorization}
                  disabled={!isEditing}
                >
                  Upload / Re-upload
                </Button>
              </Upload>
            </Space>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Other Documents"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Space orientation="vertical" style={{ width: "100%" }} size={8}>
              <Form.Item name={["documents", "other"]} noStyle>
                <Input
                  placeholder="Other Documents URL"
                  disabled={!isEditing}
                />
              </Form.Item>
              <Upload
                showUploadList={false}
                maxCount={1}
                beforeUpload={beforeUpload}
                customRequest={uploadDoc("other")}
                disabled={!isEditing}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading.other}
                  disabled={!isEditing}
                >
                  Upload / Re-upload
                </Button>
              </Upload>
            </Space>
          </Form.Item>
        </Col>
      </Row>
      <SectionButton {...sectionButtonProps} onEditingChange={setIsEditing} />
    </Card>
  );
}
