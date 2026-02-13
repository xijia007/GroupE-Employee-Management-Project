import React, { useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Input,
  DatePicker,
  Select,
  Button,
  Avatar,
  Typography,
  Tooltip,
  Grid,
  Dropdown,
  Divider,
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  EllipsisOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../services/api";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const ROLE_OPTIONS = [
  { label: "All Roles", value: "all" },
  { label: "Employee", value: "Employee" },
  { label: "HR", value: "HR" },
];

const VISA_TYPE_OPTIONS = [
  { label: "All Visa Types", value: "all" },
  { label: "H1-B", value: "H1-B" },
  { label: "L2", value: "L2" },
  { label: "F1 (CPT/OPT)", value: "F1(CPT/OPT)" },
  { label: "H4", value: "H4" },
  { label: "Other", value: "Other" },
];

const APP_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Never Submitted", value: "Never Submitted" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const SORT_OPTIONS = [
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "Visa End Date (Soonest)", value: "endSoon" },
  { label: "Visa End Date (Latest)", value: "endLate" },
];

function statusTag(status) {
  switch (status) {
    case "Approved":
      return <Tag color="green">Approved</Tag>;
    case "Pending":
      return <Tag color="gold">Pending</Tag>;
    case "Rejected":
      return <Tag color="red">Rejected</Tag>;
    default:
      return <Tag>Never Submitted</Tag>;
  }
}

function roleTag(role) {
  return role === "HR" ? (
    <Tag color="purple">HR</Tag>
  ) : (
    <Tag color="blue">Employee</Tag>
  );
}

function visaTypeTag(visaTitle) {
  const map = {
    "H1-B": "magenta",
    L2: "geekblue",
    "F1(CPT/OPT)": "purple",
    H4: "volcano",
    Other: "default",
  };
  return <Tag color={map[visaTitle] || "default"}>{visaTitle || "—"}</Tag>;
}

function daysLeftTag(endDate) {
  if (!endDate) return <Text type="secondary">—</Text>;
  const d = dayjs(endDate).startOf("day");
  const diff = d.diff(dayjs().startOf("day"), "day");
  if (diff < 0) return <Tag color="red">Expired</Tag>;
  if (diff <= 30) return <Tag color="volcano">{diff} days</Tag>;
  if (diff <= 90) return <Tag color="gold">{diff} days</Tag>;
  return <Tag color="green">{diff} days</Tag>;
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

function SafeProfileAvatar({ avatarUrl, fullName }) {
  const [loadFailed, setLoadFailed] = useState(false);

  React.useEffect(() => {
    setLoadFailed(false);
  }, [avatarUrl]);

  const source = !loadFailed ? toAbsoluteUrl(avatarUrl) : null;

  return (
    <Avatar
      src={source || undefined}
      alt={fullName}
      icon={!source ? <UserOutlined /> : undefined}
      style={
        source
          ? undefined
          : {
              background:
                "linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)",
              color: "#fff",
              fontWeight: 700,
            }
      }
      onError={() => {
        setLoadFailed(true);
        return false;
      }}
    />
  );
}

const DOCS = [
  { key: "optReceipt", label: "OPT Receipt" },
  { key: "optEad", label: "OPT EAD" },
  { key: "i983", label: "I-983" },
  { key: "i20", label: "I-20" },
];

function pickCurrStatusDoc(profile) {
  const docs = profile?.documents || {};

  // If all required documents are approved, show a single completion label.
  if (allDocumentsApproved(profile)) return { label: "All Documents Approved" };

  // Determine based on which files have been provided (uploaded) rather than status.
  // Pick the latest provided file in the required sequence.
  const lastProvided = [...DOCS].reverse().find((d) => !!docs[d.key]);
  if (!lastProvided) return { label: "OPT Receipt" };
  return { label: lastProvided.label };
}

function allDocumentsApproved(profile) {
  const docs = profile?.documents || {};
  const visaDocs = profile?.visaDocuments || {};
  return DOCS.every((d) => {
    if (!docs[d.key]) return false;
    const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
    return st === "approved";
  });
}

function computeOverallStatus(profile) {
  const docs = profile?.documents || {};
  const visaDocs = profile?.visaDocuments || {};

  const anyUploaded = DOCS.some((d) => !!docs[d.key]);
  if (!anyUploaded) return "Never Submitted";

  // 1) If any uploaded doc is rejected => Rejected
  const anyRejected = DOCS.some((d) => {
    if (!docs[d.key]) return false;
    const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
    return st === "rejected";
  });
  if (anyRejected) return "Rejected";

  // 2) If any uploaded doc is awaiting review => Pending
  const anyAwaitingReview = DOCS.some((d) => {
    if (!docs[d.key]) return false;
    const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
    return !st || st === "pending" || st === "locked" || st === "not uploaded";
  });
  if (anyAwaitingReview) return "Pending";

  // 3) Otherwise, everything uploaded so far is approved => Approved
  const allUploadedAreApproved = DOCS.filter((d) => !!docs[d.key]).every(
    (d) => {
      const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
      return st === "approved";
    },
  );
  if (allUploadedAreApproved) return "Approved";

  // Fallback
  return "Pending";
}

function pickDefaultViewDoc(profile) {
  const docs = profile?.documents || {};
  const visaDocs = profile?.visaDocuments || {};

  // Prefer docs that are awaiting review (pending/locked/missing status), otherwise
  // fall back to the first uploaded doc.
  const preferred = DOCS.find((d) => {
    if (!docs[d.key]) return false;
    const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
    return !st || st === "pending" || st === "locked" || st === "not uploaded";
  })?.key;
  if (preferred) return preferred;

  return DOCS.find((d) => !!docs[d.key])?.key;
}

async function fetchVisaList({ page, pageSize, filters }) {
  const res = await api.get("/hr/visa-status");
  const employees = res?.data?.employees || [];

  const normalized = employees.map((e) => {
    const profile = e.profile || {};
    const fullName =
      `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
      e.username;

    return {
      _id: e._id,
      userId: e._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: fullName,
      email: e.email || profile.email,
      role: e.role,
      createdAt: e.createdAt,
      avatarUrl: profile.profile_picture || "",
      visaTitle: profile?.visaInformation?.visaType || "",
      visaStartDate: profile?.visaInformation?.StartDate || null,
      visaEndDate: profile?.visaInformation?.EndDate || null,
      profile,
      status: computeOverallStatus(profile),
      allDocsApproved: allDocumentsApproved(profile),
      defaultViewDoc: pickDefaultViewDoc(profile),
      currStatusDoc: pickCurrStatusDoc(profile),
    };
  });

  let items = normalized;

  // filters
  if (filters?.role && filters.role !== "all") {
    items = items.filter((r) => r.role === filters.role);
  }
  if (filters?.visaType && filters.visaType !== "all") {
    items = items.filter((r) => r.visaTitle === filters.visaType);
  }
  if (filters?.appStatus && filters.appStatus !== "all") {
    items = items.filter((r) => r.status === filters.appStatus);
  }
  if (filters?.search) {
    const q = String(filters.search).trim().toLowerCase();
    if (q) {
      items = items.filter((r) => {
        const fullName = `${r.firstName || ""} ${r.lastName || ""}`.trim();
        return (
          fullName.toLowerCase().includes(q) ||
          String(r.email || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }
  }
  if (filters?.dateRange?.length === 2) {
    const [start, end] = filters.dateRange;
    if (start && end) {
      const s = dayjs(start).startOf("day");
      const t = dayjs(end).endOf("day");
      items = items.filter((r) => {
        if (!r.createdAt) return false;
        const c = dayjs(r.createdAt);
        return c.isAfter(s) && c.isBefore(t);
      });
    }
  }

  // sort
  switch (filters?.sortBy) {
    case "endSoon":
      items = [...items].sort(
        (a, b) =>
          dayjs(a.visaEndDate || 0).valueOf() -
          dayjs(b.visaEndDate || 0).valueOf(),
      );
      break;
    case "endLate":
      items = [...items].sort(
        (a, b) =>
          dayjs(b.visaEndDate || 0).valueOf() -
          dayjs(a.visaEndDate || 0).valueOf(),
      );
      break;
    case "last30": {
      const cutoff = dayjs().subtract(30, "day");
      items = items.filter(
        (r) => !r.createdAt || dayjs(r.createdAt).isAfter(cutoff),
      );
      break;
    }
    case "last7":
    default: {
      const cutoff = dayjs().subtract(7, "day");
      items = items.filter(
        (r) => !r.createdAt || dayjs(r.createdAt).isAfter(cutoff),
      );
      break;
    }
  }

  const total = items.length;
  const startIdx = (page - 1) * pageSize;
  const paged = items.slice(startIdx, startIdx + pageSize);

  // Return both paged rows (existing table) and the filtered full list (for In Progress)
  return { items: paged, total, allItems: items };
}

function computeNextStep(profile) {
  const docs = profile?.documents || {};
  const visaDocs = profile?.visaDocuments || {};

  // 1) If any uploaded doc is rejected, employee should re-upload that doc.
  const rejected = DOCS.find((d) => {
    if (!docs[d.key]) return false;
    const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
    return st === "rejected";
  });
  if (rejected) {
    return {
      type: "employee_upload",
      docType: rejected.key,
      label: `Re-upload ${rejected.label}`,
    };
  }

  // 2) If an uploaded doc is pending review, next step is waiting HR approval.
  const pending = DOCS.find((d) => {
    if (!docs[d.key]) return false;
    const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
    return !st || st === "pending" || st === "locked" || st === "not uploaded";
  });
  if (pending) {
    return {
      type: "waiting_hr",
      docType: pending.key,
      label: `Wait for HR approval: ${pending.label}`,
    };
  }

  // 3) Otherwise, determine next required upload based on approvals in sequence.
  for (let i = 0; i < DOCS.length; i++) {
    const current = DOCS[i];
    const previous = i > 0 ? DOCS[i - 1] : null;

    if (!docs[current.key]) {
      if (!previous) {
        return {
          type: "employee_upload",
          docType: current.key,
          label: `Upload ${current.label}`,
        };
      }

      const prevStatus = String(
        visaDocs?.[previous.key]?.status || "",
      ).toLowerCase();
      if (prevStatus === "approved") {
        return {
          type: "employee_upload",
          docType: current.key,
          label: `Upload ${current.label}`,
        };
      }

      return {
        type: "employee_upload",
        docType: previous.key,
        label: `Complete previous step: ${previous.label}`,
      };
    }
  }

  if (allDocumentsApproved(profile)) {
    return { type: "done", label: "All documents approved" };
  }

  return { type: "unknown", label: "—" };
}

export default function HrVisaStatusPage() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [notifyLoading, setNotifyLoading] = useState({});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    dateRange: null, // [dayjs, dayjs]
    role: "all",
    visaType: "all",
    appStatus: "all",
    sortBy: "last7",
    search: "",
  });

  const load = React.useCallback(
    async (nextPage = page, nextPageSize = pageSize, nextFilters = filters) => {
      setLoading(true);
      try {
        const res = await fetchVisaList({
          page: nextPage,
          pageSize: nextPageSize,
          filters: nextFilters,
        });
        setRows(res.items || []);
        setAllRows(res.allItems || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, filters],
  );

  const handleReview = React.useCallback(
    async ({ userId, docType, status, feedback }) => {
      await api.patch(`/hr/visa-status/${userId}/documents/${docType}/review`, {
        status,
        feedback,
      });
      await load(page, pageSize, filters);
    },
    [filters, load, page, pageSize],
  );

  const handlePreview = React.useCallback(async (path) => {
    try {
      const s = String(path || "");
      if (s.includes("/api/files/")) {
        const apiPath = s.startsWith("/api/") ? s.slice(4) : s;
        const res = await api.get(apiPath, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        return;
      }

      const url = toAbsoluteUrl(path);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("Failed to preview document", e);
    }
  }, []);

  const handleSendNotification = React.useCallback(async (r) => {
    const userId = r?.userId;
    if (!userId) return;

    const next = computeNextStep(r?.profile);
    if (next?.type !== "employee_upload") return;

    setNotifyLoading((p) => ({ ...p, [userId]: true }));
    try {
      await api.post(`/hr/visa-status/${userId}/notify`, {
        nextStep: next.label,
      });
      message.success("Notification sent");
    } catch (e) {
      console.error("Failed to send notification", e);
      message.error("Failed to send notification");
    } finally {
      setNotifyLoading((p) => ({ ...p, [userId]: false }));
    }
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 220,
        render: (_, r) => {
          const fullName =
            `${r.firstName || ""} ${r.lastName || ""}`.trim() || "—";
          return (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 600 }}>{fullName}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.employeeId ? `ID: ${r.employeeId}` : ""}
              </Text>
            </div>
          );
        },
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 240,
        ellipsis: true,
        render: (v) => <Text>{v || "—"}</Text>,
      },
      {
        title: "Created Date",
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: true,
        width: 140,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        width: 110,
        render: (v) => roleTag(v),
      },
      {
        title: "Visa Type",
        dataIndex: "visaTitle",
        key: "visaTitle",
        width: 140,
        render: (v) => visaTypeTag(v),
      },
      {
        title: "Visa Start",
        dataIndex: "visaStartDate",
        key: "visaStartDate",
        width: 140,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
      },
      {
        title: "Visa End",
        dataIndex: "visaEndDate",
        key: "visaEndDate",
        width: 140,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
      },
      {
        title: "Days Left",
        dataIndex: "visaEndDate",
        key: "daysLeft",
        width: 110,
        render: (v) => daysLeftTag(v),
      },
      {
        title: "Current Status File",
        dataIndex: "currStatusDoc",
        key: "currStatusFile",
        width: 190,
        ellipsis: true,
        render: (v) => {
          const label = v?.label || "—";
          if (label === "—") return <Text type="secondary">{label}</Text>;
          return <Text>{label}</Text>;
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 170,
        render: (_, r) =>
          r.allDocsApproved ? (
            <Tag color="green">All Documents Approved</Tag>
          ) : (
            <Tag color="blue">In Progress</Tag>
          ),
      },
      {
        title: "",
        key: "actions",
        align: "right",
        width: 110,
        render: (_, r) => {
          const profile = r.profile || {};
          const docs = profile.documents || {};
          const visaDocs = profile.visaDocuments || {};

          const currentPendingDocType = DOCS.find((d) => {
            if (!docs[d.key]) return false;
            const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
            return !st || st === "pending" || st === "locked";
          })?.key;

          const reviewDocType =
            currentPendingDocType ||
            [...DOCS].reverse().find((d) => !!docs[d.key])?.key;

          const approvedDocKeys = DOCS.filter((d) => {
            if (!docs[d.key]) return false;
            const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
            return st === "approved";
          }).map((d) => d.key);

          const approvedMenuItems = approvedDocKeys.map((k) => ({
            key: k,
            label: DOCS.find((d) => d.key === k)?.label || k,
          }));

          const approvedMenu = {
            items: approvedMenuItems.length
              ? approvedMenuItems
              : [
                  {
                    key: "__none__",
                    label: "No approved documents",
                    disabled: true,
                  },
                ],
            onClick: ({ key }) => {
              if (key === "__none__") return;
              const path = docs?.[key];
              handlePreview(path);
            },
          };

          if (r.allDocsApproved) {
            return (
              <Space>
                <Tooltip title="Preview approved documents">
                  <Dropdown
                    disabled={!approvedMenuItems.length}
                    trigger={["click"]}
                    menu={{
                      items: approvedMenuItems,
                      onClick: ({ key }) => {
                        const path = docs?.[key];
                        handlePreview(path);
                      },
                    }}
                  >
                    <Button icon={<EllipsisOutlined />} />
                  </Dropdown>
                </Tooltip>
              </Space>
            );
          }

          return (
            <Space>
              <Tooltip
                title={
                  reviewDocType
                    ? `Review ${DOCS.find((d) => d.key === reviewDocType)?.label || ""}`
                    : "No document to review"
                }
              >
                <Dropdown.Button
                  icon={<EllipsisOutlined />}
                  trigger={["click"]}
                  disabled={!reviewDocType}
                  menu={approvedMenu}
                  onClick={() => {
                    if (!reviewDocType) return;
                    const path = docs?.[reviewDocType];
                    handlePreview(path);
                  }}
                >
                  <EyeOutlined />
                </Dropdown.Button>
              </Tooltip>
            </Space>
          );
        },
      },
    ];
  }, [handlePreview]);

  const inProgressRows = useMemo(() => {
    return (allRows || [])
      .filter((r) => !r.allDocsApproved)
      .map((r) => ({ ...r, nextStep: computeNextStep(r.profile) }));
  }, [allRows]);

  const inProgressColumns = useMemo(() => {
    return [
      {
        title: "Name (legal full name)",
        key: "name",
        width: 240,
        render: (_, r) => {
          const fullName =
            `${r.firstName || ""} ${r.lastName || ""}`.trim() || "—";
          return (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 600 }}>{fullName}</div>
            </div>
          );
        },
      },
      {
        title: "Work Authorization",
        key: "workAuth",
        width: 220,
        render: (_, r) => (
          <div style={{ lineHeight: 1.2 }}>
            <div>{visaTypeTag(r.visaTitle)}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {(r.visaStartDate
                ? dayjs(r.visaStartDate).format("DD/MM/YYYY")
                : "—") +
                " - " +
                (r.visaEndDate
                  ? dayjs(r.visaEndDate).format("DD/MM/YYYY")
                  : "—")}
            </Text>
          </div>
        ),
      },
      {
        title: "Number of Days Remaining",
        dataIndex: "visaEndDate",
        key: "daysRemaining",
        width: 200,
        render: (v) => daysLeftTag(v),
      },
      {
        title: "Next steps",
        key: "nextSteps",
        width: 380,
        render: (_, r) => <Text>{r?.nextStep?.label || "—"}</Text>,
      },
      {
        title: "Action",
        key: "action",
        width: 520,
        render: (_, r) => {
          const profile = r.profile || {};
          const docs = profile.documents || {};
          const visaDocs = profile.visaDocuments || {};

          const currentPendingDocType = DOCS.find((d) => {
            if (!docs[d.key]) return false;
            const st = String(visaDocs?.[d.key]?.status || "").toLowerCase();
            return !st || st === "pending" || st === "locked";
          })?.key;

          if (currentPendingDocType) {
            const pendingDocPath = docs?.[currentPendingDocType];
            const pendingDocLabel =
              DOCS.find((d) => d.key === currentPendingDocType)?.label ||
              currentPendingDocType;

            return (
              <Space
                wrap
                size={isMobile ? 6 : 8}
                align={isMobile ? "start" : "center"}
              >
                {statusTag(r.status)}
                <Tooltip
                  title={
                    currentPendingDocType
                      ? `Approve ${DOCS.find((d) => d.key === currentPendingDocType)?.label || ""}`
                      : "No pending document"
                  }
                >
                  <Button
                    type="primary"
                    size={isMobile ? "small" : "middle"}
                    icon={<CheckOutlined />}
                    onClick={async () => {
                      await handleReview({
                        userId: r.userId,
                        docType: currentPendingDocType,
                        status: "approved",
                        feedback: "",
                      });
                    }}
                  />
                </Tooltip>

                <Tooltip
                  title={
                    currentPendingDocType
                      ? `Reject ${DOCS.find((d) => d.key === currentPendingDocType)?.label || ""}`
                      : "No pending document"
                  }
                >
                  <Button
                    danger
                    size={isMobile ? "small" : "middle"}
                    icon={<CloseOutlined />}
                    onClick={async () => {
                      const feedback =
                        window.prompt("Rejection feedback (required):", "") ||
                        "";
                      if (!String(feedback).trim()) {
                        message.error("Rejection feedback is required.");
                        return;
                      }
                      await handleReview({
                        userId: r.userId,
                        docType: currentPendingDocType,
                        status: "rejected",
                        feedback: String(feedback).trim(),
                      });
                    }}
                  />
                </Tooltip>

                <Tooltip
                  title={
                    pendingDocPath
                      ? `Preview ${pendingDocLabel}`
                      : "No document to preview"
                  }
                >
                  <Button
                    icon={<EyeOutlined />}
                    size={isMobile ? "small" : "middle"}
                    disabled={!pendingDocPath}
                    onClick={() => handlePreview(pendingDocPath)}
                  />
                </Tooltip>
              </Space>
            );
          }

          const next = r?.nextStep;

          if (next?.type === "waiting_hr") {
            const docType = next.docType;
            const docPath = docs?.[docType];
            const docLabel =
              DOCS.find((d) => d.key === docType)?.label || docType;

            return (
              <Space
                wrap
                size={isMobile ? 6 : 8}
                align={isMobile ? "start" : "center"}
              >
                {statusTag(r.status)}
                <Tooltip
                  title={
                    docPath ? `Preview ${docLabel}` : "No document to preview"
                  }
                >
                  <Button
                    icon={<EyeOutlined />}
                    size={isMobile ? "small" : "middle"}
                    disabled={!docPath}
                    onClick={() => handlePreview(docPath)}
                  >
                    {isMobile ? null : `Preview ${docLabel}`}
                  </Button>
                </Tooltip>

                <Tooltip title={`Approve ${docLabel}`}>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    size={isMobile ? "small" : "middle"}
                    onClick={async () => {
                      await handleReview({
                        userId: r.userId,
                        docType,
                        status: "approved",
                        feedback: "",
                      });
                    }}
                  >
                    {isMobile ? null : "Approve"}
                  </Button>
                </Tooltip>

                <Tooltip title={`Reject ${docLabel}`}>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    size={isMobile ? "small" : "middle"}
                    onClick={async () => {
                      const feedback =
                        window.prompt("Rejection feedback (required):", "") ||
                        "";
                      if (!String(feedback).trim()) {
                        message.error("Rejection feedback is required.");
                        return;
                      }
                      await handleReview({
                        userId: r.userId,
                        docType,
                        status: "rejected",
                        feedback: String(feedback).trim(),
                      });
                    }}
                  >
                    {isMobile ? null : "Reject"}
                  </Button>
                </Tooltip>
              </Space>
            );
          }

          if (next?.type === "employee_upload") {
            return (
              <Space align="center">
                <Button
                  onClick={() => handleSendNotification(r)}
                  loading={!!notifyLoading?.[r.userId]}
                >
                  Send Notification
                </Button>
              </Space>
            );
          }

          return <Text type="secondary">—</Text>;
        },
      },
    ];
  }, [
    handlePreview,
    handleReview,
    handleSendNotification,
    isMobile,
    notifyLoading,
  ]);

  // initial load (simple; if you prefer useEffect, add it)
  React.useEffect(() => {
    load(1, pageSize, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilters = async (patch) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    setPage(1);
    await load(1, pageSize, next);
  };

  return (
    <Card
      title={<span style={{ fontWeight: 700 }}>Visa Status</span>}
      bodyStyle={{ paddingTop: 12 }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <Space wrap size={10}>
          <RangePicker
            onChange={(v) => onApplyFilters({ dateRange: v })}
            allowClear
          />

          <Select
            style={{ width: 140 }}
            value={filters.role}
            options={ROLE_OPTIONS}
            onChange={(v) => onApplyFilters({ role: v })}
          />

          <Select
            style={{ width: 160 }}
            value={filters.visaType}
            options={VISA_TYPE_OPTIONS}
            onChange={(v) => onApplyFilters({ visaType: v })}
          />

          <Select
            style={{ width: 160 }}
            value={filters.appStatus}
            options={APP_STATUS_OPTIONS}
            onChange={(v) => onApplyFilters({ appStatus: v })}
          />

          <Select
            style={{ width: 180 }}
            value={filters.sortBy}
            options={SORT_OPTIONS}
            onChange={(v) => onApplyFilters({ sortBy: v })}
          />
        </Space>

        <Input
          allowClear
          style={{ width: isMobile ? "100%" : 280 }}
          prefix={<SearchOutlined />}
          placeholder="Search name or email"
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value }))
          }
          onPressEnter={() => onApplyFilters({ search: filters.search })}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <Table
          rowKey={(r) => r._id || r.userId}
          loading={loading}
          size={isMobile ? "small" : "middle"}
          columns={columns}
          dataSource={rows}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (t) => `Showing ${rows.length} of ${t} entries`,
            onChange: async (p, ps) => {
              setPage(p);
              setPageSize(ps);
              await load(p, ps, filters);
            },
          }}
        />
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* In Progress List (minimal add) */}
      <div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>In Progress</div>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <Table
            rowKey={(r) => r._id || r.userId}
            size="small"
            loading={loading}
            columns={inProgressColumns}
            dataSource={inProgressRows}
            scroll={{ x: "max-content" }}
            pagination={false}
          />
        </div>
      </div>
    </Card>
  );
}
