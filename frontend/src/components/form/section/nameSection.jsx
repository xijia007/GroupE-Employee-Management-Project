import {
  Row,
  Col,
  Button,
  Card,
  Cascader,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  TreeSelect,
  Upload,
} from "antd";
import React, { useState } from "react";
import SectionButton from "./SectionButton";

const config = {
  rules: [{ type: "object", required: true, message: "Please select time!" }],
};
const StartDate_config = {
  rules: [
    { type: "object", required: true, message: "Please select start date!" },
  ],
};
const EndDate_config = {
  rules: [
    { type: "object", required: true, message: "Please select end date!" },
  ],
};

export default function NameSection({ sectionButtonProps }) {
  const [isEditing, setIsEditing] = useState(false);
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

      <Form.Item name="profile_picture" label="Profile picture">
        <Input placeholder="http://" disabled={!isEditing} />
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
