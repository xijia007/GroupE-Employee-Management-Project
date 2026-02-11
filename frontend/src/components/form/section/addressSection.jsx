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
        <Form.Item name={["address", "street"]} style={{ marginBottom: 12 }}>
          <Input placeholder="Street Address" disabled={!isEditing} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name={["address", "building"]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Building" disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "city"]} style={{ marginBottom: 0 }}>
              <Input placeholder="City" disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "state"]} style={{ marginBottom: 0 }}>
              <Input placeholder="State" disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "zip"]} style={{ marginBottom: 0 }}>
              <Input placeholder="Zip Code" disabled={!isEditing} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <SectionButton {...sectionButtonProps} onEditingChange={setIsEditing} />
    </Card>
  );
}
