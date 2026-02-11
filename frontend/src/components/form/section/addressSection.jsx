import {
  Row,
  Col,
  Button,
  Cascader,
  DatePicker,
  Card,
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
import { useState } from "react";
import SectionButton from "./SectionButton";

export default function AddressSection({ sectionButtonProps }) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <Card
      title="Address Section"
      variant="borderless"
      style={{ marginBottom: 24 }}
    >
      <Form.Item label="Address" style={{ marginBottom: 24 }}>
        <Form.Item
          name={["address", "street"]}
          rules={[{ required: true, message: "Street is required" }]}
          style={{ marginBottom: 12 }}
        >
          <Input placeholder="Street Address" disabled={!isEditing} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name={["address", "building"]}
              rules={[{ required: true, message: "Building/Apt is required" }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Building" disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={["address", "city"]}
              rules={[{ required: true, message: "City is required" }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="City" disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={["address", "state"]}
              rules={[{ required: true, message: "State is required" }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="State" disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={["address", "zip"]}
              rules={[
                { required: true, message: "Zip is required" },
                { pattern: /^\d{5}$/, message: "5 digits" },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Zip Code" disabled={!isEditing} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <SectionButton {...sectionButtonProps} onEditingChange={setIsEditing} />
    </Card>
  );
}
