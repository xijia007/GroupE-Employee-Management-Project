import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Space,
  Steps,
  Tag,
  Upload,
  Typography,
  Divider,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const STATUS_COLOR = {
  locked: "default",
  pending: "processing",
  approved: "success",
  rejected: "error",
};

function StatusTag({ status }) {
  const map = {
    locked: "LOCKED",
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
  };
  return <Tag color={STATUS_COLOR[status]}>{map[status] ?? status}</Tag>;
}

function fileUrl(file) {
  return file?.originFileObj ? URL.createObjectURL(file.originFileObj) : null;
}

function VisaStatusManagementPage({ isOPTUser = true }) {
  const [docs, setDocs] = useState({
    optReceipt: { status: "pending", file: null, feedback: "" }, // receipt 通常来自 onboarding；这里假设 pending
    optEad: { status: "locked", file: null, feedback: "" },
    i983: { status: "locked", file: null, feedback: "" },
    i20: { status: "locked", file: null, feedback: "" },
  });

  // 解锁规则（根据当前状态派生）
  const derived = useMemo(() => {
    const next = structuredClone(docs);

    if (
      docs.optReceipt.status === "approved" &&
      next.optEad.status === "locked"
    )
      next.optEad.status = "pending"; // 或者 "ready"
    if (docs.optEad.status === "approved" && next.i983.status === "locked")
      next.i983.status = "pending";
    if (docs.i983.status === "approved" && next.i20.status === "locked")
      next.i20.status = "pending";

    return next;
  }, [docs]);

  // 当前 step index
  const currentStep = useMemo(() => {
    const order = ["optReceipt", "optEad", "i983", "i20"];
    for (let i = 0; i < order.length; i++) {
      const s = derived[order[i]].status;
      if (s !== "approved") return i; // 第一个未 approved 的就是当前
    }
    return 3;
  }, [derived]);

  if (!isOPTUser) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
        <Title level={3}>Visa Status Management</Title>
        <Alert
          type="info"
          message="No work authorization documents required"
          description="You did not select OPT for onboarding, so this page is not applicable."
          showIcon
        />
      </div>
    );
  }

  const onUpload =
    (key) =>
    ({ file }) => {
      setDocs((prev) => ({
        ...prev,
        [key]: { ...prev[key], file, status: "pending", feedback: "" }, // 上传后进入 pending（等待 HR）
      }));
      return false; // 阻止自动上传
    };

  const renderMessage = (key) => {
    const { status, feedback } = derived[key];

    if (status === "locked") {
      return (
        <Alert
          type="warning"
          showIcon
          message="Locked"
          description="Complete the previous step first."
        />
      );
    }

    if (status === "pending") {
      const msgMap = {
        optReceipt: "Waiting for HR to approve your OPT Receipt.",
        optEad: "Waiting for HR to approve your OPT EAD.",
        i983: "Waiting for HR to approve and sign your I-983.",
        i20: "Waiting for HR to approve your I-20.",
      };
      return (
        <Alert
          type="info"
          showIcon
          message="In review"
          description={msgMap[key]}
        />
      );
    }

    if (status === "approved") {
      const msgMap = {
        optReceipt: "Please upload a copy of your OPT EAD.",
        optEad: "Please download and fill out the I-983 form.",
        i983: "Please send the I-983 along with all necessary documents to your school and upload the new I-20.",
        i20: "All documents have been approved.",
      };
      return (
        <Alert
          type="success"
          showIcon
          message="Approved"
          description={msgMap[key]}
        />
      );
    }

    // rejected
    return (
      <Alert
        type="error"
        showIcon
        message="Rejected"
        description={
          feedback ||
          "HR has rejected this document. Please check feedback and re-upload."
        }
      />
    );
  };

  const renderActions = (key) => {
    const { status, file } = derived[key];
    const url = fileUrl(file);

    const canUpload = status !== "locked" && status !== "approved"; // approved 后通常不允许再改（你也可以允许重新上传）
    const uploadBtn = (
      <Upload
        beforeUpload={onUpload(key)}
        maxCount={1}
        accept=".pdf,.png,.jpg,.jpeg"
      >
        <Button icon={<UploadOutlined />} disabled={!canUpload}>
          Upload
        </Button>
      </Upload>
    );

    const previewBtn = (
      <Button
        icon={<EyeOutlined />}
        disabled={!url}
        onClick={() => url && window.open(url, "_blank")}
      >
        Preview
      </Button>
    );

    const downloadBtn = (
      <Button
        icon={<DownloadOutlined />}
        disabled={!url}
        onClick={() => {
          if (!url) return;
          const a = document.createElement("a");
          a.href = url;
          a.download = file?.name || `${key}.pdf`;
          a.click();
        }}
      >
        Download
      </Button>
    );

    // I-983 模板下载（这里先放 placeholder，后续换成你真实文件 URL）
    const i983Templates =
      key === "i983" ? (
        <Space>
          <Button icon={<DownloadOutlined />}>Empty Template (PDF)</Button>
          <Button icon={<DownloadOutlined />}>Sample Template (PDF)</Button>
        </Space>
      ) : null;

    return (
      <Space wrap>
        {i983Templates}
        {uploadBtn}
        {previewBtn}
        {downloadBtn}
      </Space>
    );
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Title level={3}>Visa Status Management</Title>
      <Text type="secondary">
        Track your OPT work authorization documents and complete the required
        steps in order.
      </Text>

      <Divider />

      <Steps
        current={currentStep}
        items={[
          { title: "OPT Receipt" },
          { title: "OPT EAD" },
          { title: "I-983" },
          { title: "I-20" },
        ]}
      />

      <Divider />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {[
          { key: "optReceipt", title: "OPT Receipt" },
          { key: "optEad", title: "OPT EAD" },
          { key: "i983", title: "I-983" },
          { key: "i20", title: "I-20" },
        ].map((step) => (
          <Card
            key={step.key}
            title={
              <Space>
                <Text strong>{step.title}</Text>
                <StatusTag status={derived[step.key].status} />
              </Space>
            }
          >
            {renderMessage(step.key)}
            <div style={{ marginTop: 12 }}>{renderActions(step.key)}</div>
          </Card>
        ))}
      </Space>
    </div>
  );
}

export default VisaStatusManagementPage;
