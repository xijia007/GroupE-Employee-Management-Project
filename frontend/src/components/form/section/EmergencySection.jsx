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
import React, { useState } from "react";
import SectionButton from "./SectionButton";

export default function EmergencySection({ sectionButtonProps }) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <Card
      title="Emergency Contact Information"
      variant="borderless"
      style={{ marginBottom: 24 }}
    >
      <Form.Item
        label=" "
        colon={false}
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        style={{ marginBottom: 24 }}
        name="EmergencyContact"
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 1000,
              margin: "0 auto",
              border: "1px solid #d9d9d9",
              borderRadius: 12,
              padding: 24,
              background: "#fafafa",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Emergency Contact Person
            </div>

            {/* First Row */}
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name={["emergencyContacts", 0, "firstName"]}
                  rules={[{ required: true, message: "First name required" }]}
                  style={{ marginBottom: 16 }}
                >
                  <Input
                    size="large"
                    placeholder="First Name"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name={["emergencyContacts", 0, "middleName"]}
                  style={{ marginBottom: 16 }}
                >
                  <Input
                    size="large"
                    placeholder="Middle Name"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name={["emergencyContacts", 0, "lastName"]}
                  rules={[{ required: true, message: "Last name required" }]}
                  style={{ marginBottom: 16 }}
                >
                  <Input
                    size="large"
                    placeholder="Last Name"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Second Row */}
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name={["emergencyContacts", 0, "relationship"]}
                  rules={[{ required: true, message: "Relationship required" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="large"
                    placeholder="Relationship"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name={["emergencyContacts", 0, "phone"]}
                  rules={[
                    { required: true, message: "Phone required" },
                    {
                      pattern: /^\d{3}-\d{3}-\d{4}$/,
                      message: "Format: XXX-XXX-XXXX",
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="large"
                    placeholder="Phone Number"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name={["emergencyContacts", 0, "email"]}
                  rules={[
                    { required: true, message: "Email required" },
                    { type: "email", message: "Invalid email" },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="large"
                    placeholder="Email"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      </Form.Item>
      <SectionButton {...sectionButtonProps} onEditingChange={setIsEditing} />
    </Card>
  );
}
