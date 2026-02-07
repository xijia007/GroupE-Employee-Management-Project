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
import React from "react";

export default function ContactSection() {
  return (
    <Card
      title="Contact Information"
      bordered={false}
      style={{ marginBottom: 24 }}
    >
      <Form.Item label="Contact Information" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={["contactInfo", "cellPhone"]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Cell Phone" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={["contactInfo", "workPhone"]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Work Phone" />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </Card>
  );
}
