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
import { UploadOutlined } from "@ant-design/icons";
import React, { useState } from "react";

export default function UploadDocument() {
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
  const [documents, setDocuments] = useState([]);
  const handleUpload = ({ fileList }) => {
    setDocuments(fileList);
  };
  return (
    <Card title="Documents" bordered={false} style={{ marginBottom: 24 }}>
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
    </Card>
  );
}
