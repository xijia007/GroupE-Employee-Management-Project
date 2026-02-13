import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Grid,
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
import api from "../../services/api";

const { Title, Text } = Typography;

const STATUS_COLOR = {
  "Not Uploaded": "default",
  locked: "default",
  pending: "processing",
  approved: "success",
  rejected: "error",
};

function StatusTag({ status }) {
  const map = {
    "Not Uploaded": "NOT UPLOADED",
    locked: "LOCKED",
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
  };
  return <Tag color={STATUS_COLOR[status]}>{map[status] ?? status}</Tag>;
}

function fileUrl(file) {
  if (typeof file === "string" && file.trim()) return file;
  const blob = file?.originFileObj ?? file;
  return blob instanceof Blob ? URL.createObjectURL(blob) : null;
}

function toAbsoluteUrl(urlOrPath) {
  if (!urlOrPath) return null;
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;

  const cleaned = String(urlOrPath).replace(/\\/g, "/");

  const apiBaseUrl = api?.defaults?.baseURL || "http://localhost:3001/api";
  const origin = apiBaseUrl.replace(/\/api\/?$/, "");
  const normalizedPath = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return `${origin}${normalizedPath}`;
}

function toApiRelativePath(urlOrPath) {
  if (!urlOrPath) return null;

  let pathname = String(urlOrPath);
  try {
    if (/^https?:\/\//i.test(pathname)) {
      const u = new URL(pathname);
      pathname = `${u.pathname}${u.search || ""}`;
    }
  } catch {
    // ignore URL parse issues
  }

  pathname = pathname.replace(/\\/g, "/");

  // Convert stored link like /api/files/... to axios api baseURL relative (/files/...)
  if (pathname.startsWith("/api/")) return pathname.slice(4);
  if (pathname.startsWith("api/")) return `/${pathname.slice(3)}`;

  // If it's already /files/... keep as-is
  if (pathname.startsWith("/files/")) return pathname;

  return null;
}

function filenameFromLink(urlOrPath, fallback) {
  if (!urlOrPath) return fallback;
  const s = String(urlOrPath);
  const noQuery = s.split("?")[0];
  const last = noQuery.split("/").filter(Boolean).pop();
  if (!last) return fallback;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

async function fetchFileBlob(urlOrPath) {
  const apiPath = toApiRelativePath(urlOrPath);
  if (!apiPath) return null;
  const res = await api.get(apiPath, { responseType: "blob" });
  return res?.data || null;
}

function VisaStatusManagementPage({ isOPTUser = true }) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [docs, setDocs] = useState({
    optReceipt: { status: "Not Uploaded", file: null, feedback: "" },
    optEad: { status: "locked", file: null, feedback: "" },
    i983: { status: "locked", file: null, feedback: "" },
    i20: { status: "locked", file: null, feedback: "" },
  });

  useEffect(() => {
    let cancelled = false;

    const refreshProfile = async () => {
      try {
        const res = await api.get("/info/profile");
        if (cancelled) return;

        const profileDocs = res?.data?.documents || {};
        const visaDocs = res?.data?.visaDocuments || {};

        setDocs((prev) => {
          const next = { ...prev };
          for (const key of ["optReceipt", "optEad", "i983", "i20"]) {
            const file = profileDocs?.[key] || null;
            const serverStatus = visaDocs?.[key]?.status;
            const serverFeedback = visaDocs?.[key]?.feedback;

            // Normalize server status to UI status.
            // Source of truth is whether a file exists:
            // - No file => "Not Uploaded" (even if legacy status says pending/locked)
            // - Has file => if status is missing/"Not Uploaded"/"locked" => treat as "pending"
            let status;
            if (!file) {
              status = "Not Uploaded";
            } else {
              const normalized = String(serverStatus || "").toLowerCase();
              if (
                !serverStatus ||
                normalized === "locked" ||
                normalized === "not uploaded"
              ) {
                status = "pending";
              } else {
                status = serverStatus;
              }
            }

            next[key] = {
              ...next[key],
              file,
              status,
              feedback: serverFeedback || "",
            };
          }
          return next;
        });
      } catch {
        // ignore load failures (e.g. not logged in)
      }
    };

    // Initial load
    refreshProfile();

    // If user navigates away/back without unmounting, refresh on focus/visibility.
    const onFocus = () => refreshProfile();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshProfile();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // 解锁规则：不再把 "locked" 当成后端/状态字段存储，而是 UI 根据流程派生“是否锁定”。
  const isFlowLocked = useMemo(() => {
    return {
      optReceipt: false,
      optEad: docs.optReceipt.status !== "approved",
      i983: docs.optEad.status !== "approved",
      i20: docs.i983.status !== "approved",
    };
  }, [docs]);

  // 当前 step index
  const currentStep = useMemo(() => {
    const order = ["optReceipt", "optEad", "i983", "i20"];
    for (let i = 0; i < order.length; i++) {
      const s = docs[order[i]].status;
      if (s !== "approved") return i; // 第一个未 approved 的就是当前
    }
    return 3;
  }, [docs]);

  if (!isOPTUser) {
    return (
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: isMobile ? 16 : 24,
        }}
      >
        <Title
          level={3}
          style={{ marginTop: 0, marginBottom: isMobile ? 8 : 12 }}
        >
          Visa Status Management
        </Title>
        <Alert
          type="info"
          title="No work authorization documents required"
          description="You did not select OPT for onboarding, so this page is not applicable."
          showIcon
        />
      </div>
    );
  }

  const uploadToProfile = async (key, file, onSuccess, onError) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(`/info/profile/documents/${key}`, formData, {
        headers: {
          // override api.js default application/json for this multipart request
          "Content-Type": "multipart/form-data",
        },
      });
      const savedPath = res?.data?.path;
      const savedStatus = res?.data?.profile?.visaDocuments?.[key]?.status;
      const savedFeedback = res?.data?.profile?.visaDocuments?.[key]?.feedback;

      setDocs((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          file: savedPath || prev[key].file,
          status: savedStatus || "pending",
          feedback: savedFeedback || "",
        },
      }));

      onSuccess?.(res?.data);
    } catch (err) {
      onError?.(err);
    }
  };

  const renderMessage = (key) => {
    const { status, feedback } = docs[key];

    if (isFlowLocked[key]) {
      return (
        <Alert
          type="warning"
          showIcon
          title="Locked"
          description="Complete the previous step first."
        />
      );
    }
    if (status === "Not Uploaded") {
      const msgMap = {
        optReceipt: "Please upload a copy of your OPT Receipt.",
        optEad: "Please upload a copy of your OPT EAD.",
        i983: "Please upload your I-983 form.",
        i20: "Please upload your I-20 form.",
      };
      return (
        <Alert
          type="warning"
          showIcon
          title="Not Uploaded"
          description={msgMap[key]}
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
          title="In review"
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
          title="Approved"
          description={msgMap[key]}
        />
      );
    }

    // rejected
    return (
      <Alert
        type="error"
        showIcon
        title="Rejected"
        description={
          feedback ||
          "HR has rejected this document. Please check feedback and re-upload."
        }
      />
    );
  };

  const renderActions = (key) => {
    const { status, file } = docs[key];
    const storedLinkOrBlobUrl = fileUrl(file);
    const url = toAbsoluteUrl(storedLinkOrBlobUrl);

    const downloadName =
      typeof file === "string" && file.trim()
        ? filenameFromLink(file, `${key}.pdf`)
        : file?.name || `${key}.pdf`;

    const uploadFileList = url
      ? [
          {
            uid: `${key}-1`,
            name: downloadName,
            status: "done",
            url,
          },
        ]
      : [];

    const canUpload =
      !isFlowLocked[key] && status !== "approved" && status !== "pending"; // pending 时避免重复提交；rejected/Not Uploaded 允许上传
    const uploadBtn = (
      <Upload
        customRequest={({ file, onSuccess, onError }) =>
          uploadToProfile(key, file, onSuccess, onError)
        }
        maxCount={1}
        accept=".pdf,.png,.jpg,.jpeg"
        fileList={uploadFileList}
        showUploadList={{
          showRemoveIcon: false,
          showPreviewIcon: false,
          showDownloadIcon: false,
        }}
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
        onClick={async () => {
          if (!storedLinkOrBlobUrl) return;

          // New: secured DB files (/api/files/...) => fetch as blob with Authorization
          const blob = await fetchFileBlob(storedLinkOrBlobUrl);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
            return;
          }

          // Legacy: public static /uploads/... or any absolute URL
          const absolute = toAbsoluteUrl(storedLinkOrBlobUrl);
          if (absolute) window.open(absolute, "_blank", "noopener,noreferrer");
        }}
      >
        Preview
      </Button>
    );

    const downloadBtn = (
      <Button
        icon={<DownloadOutlined />}
        disabled={!url}
        onClick={async () => {
          if (!storedLinkOrBlobUrl) return;

          const blob = await fetchFileBlob(storedLinkOrBlobUrl);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = downloadName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
            return;
          }

          // Legacy fallback
          const absolute = toAbsoluteUrl(storedLinkOrBlobUrl);
          if (!absolute) return;
          const a = document.createElement("a");
          a.href = absolute;
          a.download = downloadName;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }}
      >
        Download
      </Button>
    );

    return (
      <Space wrap size={6}>
        {uploadBtn}
        {previewBtn}
        {downloadBtn}
      </Space>
    );
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: isMobile ? 16 : 24,
      }}
    >
      <Title
        level={3}
        style={{ marginTop: 0, marginBottom: isMobile ? 8 : 12 }}
      >
        Visa Status Management
      </Title>
      <div style={{ marginBottom: 8 }}>
        <Text
          type="secondary"
          style={{
            display: "block",
            margin: 0,
            lineHeight: 1.4,
            whiteSpace: "normal",
          }}
        >
          Track your OPT work authorization documents and complete the required
          steps in order.
        </Text>
      </div>

      <Divider style={{ margin: isMobile ? "6px 0" : "12px 0" }} />

      <Steps
        current={currentStep}
        size={isMobile ? "small" : "default"}
        items={[
          { title: "OPT Receipt" },
          { title: "OPT EAD" },
          { title: "I-983" },
          { title: "I-20" },
        ]}
      />
      <Space
        orientation="vertical"
        size={isMobile ? 8 : 12}
        style={{ width: "100%" }}
      >
        {[
          { key: "optReceipt", title: "OPT Receipt" },
          { key: "optEad", title: "OPT EAD" },
          { key: "i983", title: "I-983" },
          { key: "i20", title: "I-20" },
        ].map((step) => (
          <Card
            key={step.key}
            style={{ body: { padding: isMobile ? 16 : 24 } }}
            title={
              <Space>
                <Text strong>{step.title}</Text>
                <StatusTag
                  status={
                    isFlowLocked[step.key] ? "locked" : docs[step.key].status
                  }
                />
              </Space>
            }
          >
            {renderMessage(step.key)}
            <div style={{ marginTop: isMobile ? 4 : 6 }}>
              {renderActions(step.key)}
            </div>
          </Card>
        ))}
      </Space>
    </div>
  );
}

export default VisaStatusManagementPage;
