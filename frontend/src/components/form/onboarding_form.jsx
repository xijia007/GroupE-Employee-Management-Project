import React from "react";
import { Steps } from "antd";
import { useState } from "react";
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
  Switch,
  TreeSelect,
  Upload,
} from "antd";

const config = {
  rules: [{ type: "object", required: true, message: "Please select time!" }],
};

function OnboardingForm() {
  const [componentSize, setComponentSize] = useState("default");
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };
  const [form] = Form.useForm();
  const profileUrl = Form.useWatch("profilePicture", form);

  const usResident = Form.useWatch("usResident", form); // yes/no
  const workAuth = Form.useWatch("workAuth", form); // h1b/l2/f1/h4/other
  const IsReference = Form.useWatch("IsReference", form); // yes/no
  return (
    <div
      style={{
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
          top: 0,
          right: 0,
          marginBottom: 0,
          zIndex: 1,
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

        <Form.Item label="Preferred Name">
          <Input />
        </Form.Item>

        <Form.Item name="profilePicture" label="Profile picture">
          <Input
            placeholder="https://..."
            addonAfter={
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <span style={{ fontSize: 12, color: "#999" }}>—</span>
                )}
              </div>
            }
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input />
        </Form.Item>

        <Form.Item label="Social Security Number(SSN)">
          <Input />
        </Form.Item>

        <Form.Item label="Gender">
          <Select
            options={[
              { label: "Female", value: "female" },
              { label: "Male", value: "male" },
              { label: "Other", value: "other" },
            ]}
          />
        </Form.Item>
        <Form.Item name="date-picker" label="DatePicker" {...config}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        {/* vii. Permanent resident or citizen of the U.S.? */}
        <Form.Item
          name="usResident"
          label="Permanent resident or citizen of U.S.?"
          rules={[{ required: true, message: "Please select yes/no" }]}
        >
          <Select
            placeholder="Select"
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
          />
        </Form.Item>

        {/* If YES: choose Green Card or Citizen */}
        {usResident === "yes" && (
          <Form.Item
            name="usYesType"
            label="If yes, choose"
            rules={[
              {
                required: true,
                message: "Please choose Green Card or Citizen",
              },
            ]}
          >
            <Select
              placeholder="Select"
              options={[
                { label: "Green Card", value: "greenCard" },
                { label: "Citizen", value: "citizen" },
              ]}
            />
          </Form.Item>
        )}

        {/* If NO: work authorization */}
        {usResident === "no" && (
          <>
            <Form.Item
              name="workAuth"
              label="Work authorization"
              rules={[
                {
                  required: true,
                  message: "Please select your work authorization",
                },
              ]}
            >
              <Select
                placeholder="Select"
                options={[
                  { label: "H1-B", value: "h1b" },
                  { label: "L2", value: "l2" },
                  { label: "F1 (CPT/OPT)", value: "f1" },
                  { label: "H4", value: "h4" },
                  { label: "Other", value: "other" },
                ]}
              />
            </Form.Item>

            {/* If F1: upload OPT receipt */}
            {workAuth === "f1" && (
              <Form.Item
                name="optReceipt"
                label="OPT receipt (PDF)"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                rules={[
                  { required: true, message: "Please upload your OPT receipt" },
                ]}
              >
                <Upload beforeUpload={() => false} accept=".pdf" maxCount={1}>
                  <Button>Upload PDF</Button>
                </Upload>
              </Form.Item>
            )}

            {/* If Other: specify visa title */}
            {workAuth === "other" && (
              <Form.Item
                name="visaTitle"
                label="Visa title"
                rules={[
                  { required: true, message: "Please specify your visa title" },
                ]}
              >
                <Input placeholder="e.g., O-1, TN, J-2..." />
              </Form.Item>
            )}

            {/* Start and end date */}
            <Form.Item
              name="workAuthRange"
              label="Start and end date"
              rules={[
                {
                  type: "array",
                  required: true,
                  message: "Please select date range",
                },
              ]}
            >
              <DatePicker.RangePicker style={{ width: "100%" }} />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="IsReference"
          label="Reference"
          rules={[{ required: true, message: "Please select yes/no" }]}
        >
          <Select
            placeholder="Select"
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
          />
        </Form.Item>
        {IsReference === "yes" && (
          // 用一个空 label 的 Form.Item 保持和其他行对齐（container 从输入框起点开始）
          <Form.Item label=" " colon={false}>
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 10,
                padding: 16,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Reference Person
              </div>

              {/* 第一行：First / Middle / Last */}
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name={["reference", "firstName"]}
                    rules={[{ required: true, message: "First name required" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="First Name" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["reference", "middleName"]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="Middle Name" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["reference", "lastName"]}
                    rules={[{ required: true, message: "Last name required" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              {/* 第二行：Relationship / Phone / Email（你截图里 Relationship 掉到下面且不齐，就是缺这个 Row/Col） */}
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name={["reference", "relationship"]}
                    rules={[
                      { required: true, message: "Relationship required" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Relationship" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["reference", "phone"]}
                    rules={[{ required: true, message: "Phone required" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Phone Number" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["reference", "email"]}
                    rules={[
                      { required: true, message: "Email required" },
                      { type: "email", message: "Invalid email" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Email" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form.Item>
        )}

        <Form.Item>
          <Button>Submit</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
export default OnboardingForm;
