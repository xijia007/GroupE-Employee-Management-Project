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
import SectionButton from "./SectionButton";

export default function UploadDocument({ sectionButtonProps }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card title="Documents" variant="borderless" style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Form.Item
            name={["documents", "driverLicense"]}
            label="Driver License"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Driver License URL" disabled={!isEditing} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name={["documents", "workAuthorization"]}
            label="Work Authorization"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Work Authorization URL" disabled={!isEditing} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name={["documents", "other"]}
            label="Other Documents"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input placeholder="Other Documents URL" disabled={!isEditing} />
          </Form.Item>
        </Col>
      </Row>
      <SectionButton {...sectionButtonProps} onEditingChange={setIsEditing} />
    </Card>
  );
}
