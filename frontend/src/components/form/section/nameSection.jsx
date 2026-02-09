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
import React from "react";

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

export default function NameSection() {
  return (
    <Card
      title="Name Section"
      variant="borderless"
      style={{ marginBottom: 24 }}
    >
      <Form.Item label="Name" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="firstName" style={{ marginBottom: 0 }}>
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="middleName" style={{ marginBottom: 0 }}>
              <Input placeholder="Middle Name" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="lastName" style={{ marginBottom: 0 }}>
              <Input placeholder="Last Name" />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item name="preferredName" label="Preferred Name">
        <Row gutter={16}>
          <Col span={8}>
            <Input placeholder="Preferred Name" />
          </Col>
        </Row>
      </Form.Item>

      <Form.Item name="profile_picture" label="Profile picture">
        <Input placeholder="http://" />
      </Form.Item>

      <Form.Item name="email" label="Email">
        <Input />
      </Form.Item>

      <Form.Item label="Social Security Number">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="ssn" noStyle>
              <Input placeholder="SSN" />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label="Date of Birth" {...config}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="dateOfBirth" noStyle rules={config.rules}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item label="Gender">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="gender" noStyle>
              <Select
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
    </Card>
  );
}
