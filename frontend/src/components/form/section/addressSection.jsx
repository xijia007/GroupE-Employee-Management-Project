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

export default function AddressSection() {
  return (
    <Card title="Address Section" bordered={false} style={{ marginBottom: 24 }}>
      <Form.Item label="Address" style={{ marginBottom: 24 }}>
        <Form.Item name={["address", "street"]} style={{ marginBottom: 12 }}>
          <Input placeholder="Street Address" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name={["address", "building"]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Building" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "city"]} style={{ marginBottom: 0 }}>
              <Input placeholder="City" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "state"]} style={{ marginBottom: 0 }}>
              <Input placeholder="State" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "zip"]} style={{ marginBottom: 0 }}>
              <Input placeholder="Zip Code" />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </Card>
  );
}
