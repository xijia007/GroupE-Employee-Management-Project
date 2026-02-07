import React from "react";
import { Steps } from "antd";
import { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import NameSection from "./section/nameSection";
import AddressSection from "./section/addressSection";
import ContactSection from "./section/contactSection";
import VisaInformationSection from "./section/visaInformationSection";
import EmergencySection from "./section/EmergencySection";
import UploadDocument from "./section/uploadDocument";
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
        <NameSection />
        <AddressSection />
        <ContactSection />
        <VisaInformationSection />
        <EmergencySection />
        <UploadDocument />

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
