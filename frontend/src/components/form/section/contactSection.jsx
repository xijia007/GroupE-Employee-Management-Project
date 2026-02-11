import {
  Row,
  Col,
  Button,
  Cascader,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Switch,
  Card,
  Table,
  TreeSelect,
  Upload,
} from "antd";
import React, { useState } from "react";
import SectionButton from "./SectionButton";

export default function ContactSection({ sectionButtonProps }) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <Card
      title="Contact Information"
      variant="borderless"
      style={{ marginBottom: 24 }}
    >
      <Form.Item label="Contact Information" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={["contactInfo", "cellPhone"]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Cell Phone" disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={["contactInfo", "workPhone"]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Work Phone" disabled={!isEditing} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <SectionButton {...sectionButtonProps} onEditingChange={setIsEditing} />
    </Card>
  );
}
