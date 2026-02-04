import React from "react";
import { Steps } from "antd";
import { useState } from "react";
import {
  UploadOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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
  Upload,
} from "antd";

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

function PersonInformation() {
  const [documents, setDocuments] = useState([]);
  const handleUpload = ({ fileList }) => {
    setDocuments(fileList);
  };
  const columns = [
    {
      title: "File Name",
      dataIndex: "name",
    },
    {
      title: "Action",
      render: (_, file) => (
        <Space>
          {/* Preview */}
          <Button
            size="small"
            onClick={() =>
              window.open(
                file.thumbUrl || URL.createObjectURL(file.originFileObj),
              )
            }
          >
            Preview
          </Button>

          {/* Download */}
          <a
            href={file.thumbUrl || URL.createObjectURL(file.originFileObj)}
            download={file.name}
          >
            <Button size="small">Download</Button>
          </a>
        </Space>
      ),
    },
  ];
  const [componentSize, setComponentSize] = useState("default");
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };
  const [form] = Form.useForm();
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <Form.Item
        label="Form Size"
        name="size"
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          marginBottom: 0,
          zIndex: 10,
        }}
      >
        <Radio.Group
          onChange={(e) => setComponentSize(e.target.value)}
          value={componentSize}
        >
          <Radio.Button value="small">Small</Radio.Button>
          <Radio.Button value="default">Default</Radio.Button>
          <Radio.Button value="large">Large</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form
        form={form}
        labelWrap
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        initialValues={{ size: componentSize }}
        onValuesChange={onFormLayoutChange}
        size={componentSize}
        style={{ maxWidth: 1200, paddingTop: 50 }}
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

        <Form.Item name="ssn" label="Social Security Number">
          <Row gutter={16}>
            <Col span={16}>
              <Input placeholder="SSN" />
            </Col>
          </Row>
        </Form.Item>
        <Form.Item name="dateOfBirth" label="Date of Birth" {...config}>
          <Row gutter={16}>
            <Col span={8}>
              <DatePicker style={{ width: "100%" }} />
            </Col>
          </Row>
        </Form.Item>

        <Form.Item name="gender" label="Gender">
          <Row gutter={16}>
            <Col span={8}>
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
            </Col>
          </Row>
        </Form.Item>
        <Form.Item label="Address" style={{ marginBottom: 24 }}>
          <Form.Item name={["address", "street"]} style={{ marginBottom: 0 }}>
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
              <Form.Item
                name={["address", "state"]}
                style={{ marginBottom: 0 }}
              >
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
        <Form.Item label="Contact Information">
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
                rules={[
                  { required: true, message: "Please select start date" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Start Date"
                />
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
        <Form.Item
          label="Emergency Contacts"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ marginBottom: 24 }}
        >
          <Form.List name="emergencyContacts">
            {(fields, { add, remove }) => (
              <div style={{ width: "100%" }}>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    style={{
                      marginBottom: 24,
                      padding: 24,
                      border: "1px solid #d9d9d9",
                      borderRadius: 12,
                      background: "#fafafa",
                      position: "relative",
                    }}
                  >
                    {/* 标题和删除按钮 */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        Emergency Contact {index + 1}
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* 第一行: First Name, Middle Name, Last Name */}
                    <Row gutter={20}>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "firstName"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter first name",
                            },
                          ]}
                          style={{ marginBottom: 16 }}
                        >
                          <Input size="large" placeholder="First Name" />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "middleName"]}
                          style={{ marginBottom: 16 }}
                        >
                          <Input size="large" placeholder="Middle Name" />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "lastName"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter last name",
                            },
                          ]}
                          style={{ marginBottom: 16 }}
                        >
                          <Input size="large" placeholder="Last Name" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* 第二行: Relationship, Phone, Email */}
                    <Row gutter={20}>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "relationship"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter relationship",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input size="large" placeholder="Relationship" />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "phone"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter phone number",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input size="large" placeholder="Phone Number" />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "email"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter email",
                            },
                            { type: "email", message: "Invalid email format" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input size="large" placeholder="Email" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}

                {/* Add Contact 按钮 */}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{
                    height: 48,
                    fontSize: 16,
                  }}
                >
                  Add Emergency Contact
                </Button>
              </div>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item label="Documents">
          <div style={{ width: "100%" }}>
            <Upload
              multiple
              beforeUpload={() => false} // ⭐ 不自动上传，只保存在前端
              onChange={handleUpload}
              fileList={documents}
            >
              <Button icon={<UploadOutlined />}>Upload Documents</Button>
            </Upload>

            <Table
              style={{ marginTop: 16 }}
              columns={columns}
              dataSource={documents}
              rowKey="uid"
              pagination={false}
            />
          </div>
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Form.Item>
            <Button danger>Cancel</Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary">Save</Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
export default PersonInformation;
