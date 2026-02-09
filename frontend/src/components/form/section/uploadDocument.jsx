import {
  Row,
  Col,
  Button,
  Cascader,
  DatePicker,
  Form,
  Input,
  Card,
  InputNumber,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  TreeSelect,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useState } from "react";

export default function UploadDocument() {
  const columns = [
    {
      title: "File Name",
      dataIndex: "name",
    },
    {
      title: "Action",
      render: (_, file) => (
        <Space>
          {/* Preview */}
          <Button
            size="small"
            onClick={() =>
              window.open(
                file.thumbUrl || URL.createObjectURL(file.originFileObj),
              )
            }
          >
            Preview
          </Button>

          {/* Download */}
          <a
            href={file.thumbUrl || URL.createObjectURL(file.originFileObj)}
            download={file.name}
          >
            <Button size="small">Download</Button>
          </a>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Documents" variant="borderless" style={{ marginBottom: 24 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={["documents", "driverLicense"]}
            label="Driver License"
          >
            <Input placeholder="Driver License URL" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["documents", "workAuthorization"]}
            label="Work Authorization"
          >
            <Input placeholder="Work Authorization URL" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={["documents", "other"]} label="Other Documents">
            <Input placeholder="Other Documents URL" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
