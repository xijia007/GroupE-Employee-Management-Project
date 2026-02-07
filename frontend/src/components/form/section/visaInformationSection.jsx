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
  Table,
  TreeSelect,
  Card,
  Upload,
} from "antd";

export default function VisaInformationSection() {
  return (
    <Card
      title="Visa Information"
      bordered={false}
      style={{ marginBottom: 24 }}
    >
      <Form.Item name="visaInformation" label="Visa information">
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Form.Item
              name={["visaInformation", "visaType"]}
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Please enter visa title" }]}
            >
              <Input placeholder="Visa Title" style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name={["visaInformation", "StartDate"]}
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="Start Date" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name={["visaInformation", "EndDate"]}
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="End Date" />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </Card>
  );
}
