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
  Dropdown,
  Typography,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  BellOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

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

// TODO: replace with real API call
async function fetchVisaList({ page, pageSize, filters }) {
  return {
    items: [],
    total: 0,
  };
}

export default function HrVisaStatusManagement() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

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

  const columns = useMemo(() => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (_, r) => {
          const fullName =
            `${r.firstName || ""} ${r.lastName || ""}`.trim() || "—";
          return (
            <Space>
              <Avatar src={r.avatarUrl} alt={fullName}>
                {fullName?.[0] || "U"}
              </Avatar>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 600 }}>{fullName}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {r.employeeId ? `ID: ${r.employeeId}` : ""}
                </Text>
              </div>
            </Space>
          );
        },
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (v) => <Text>{v || "—"}</Text>,
      },
      {
        title: "Created Date",
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: true,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (v) => roleTag(v),
      },
      {
        title: "Visa Type",
        dataIndex: "visaTitle",
        key: "visaTitle",
        render: (v) => visaTypeTag(v),
      },
      {
        title: "Visa Start",
        dataIndex: "visaStartDate",
        key: "visaStartDate",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
      },
      {
        title: "Visa End",
        dataIndex: "visaEndDate",
        key: "visaEndDate",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
      },
      {
        title: "Days Left",
        dataIndex: "visaEndDate",
        key: "daysLeft",
        render: (v) => daysLeftTag(v),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (v) => statusTag(v),
      },
      {
        title: "",
        key: "actions",
        align: "right",
        render: (_, r) => {
          const menuItems = [
            {
              key: "view",
              icon: <EyeOutlined />,
              label: "View details",
            },
            {
              key: "edit",
              icon: <EditOutlined />,
              label: "Edit visa info",
            },
            {
              key: "remind",
              icon: <BellOutlined />,
              label: "Send reminder",
              disabled: !r.visaEndDate,
            },
            {
              key: "export",
              icon: <DownloadOutlined />,
              label: "Export row",
            },
          ];

          return (
            <Space>
              <Tooltip title="View">
                <Button icon={<EyeOutlined />} />
              </Tooltip>
              <Dropdown
                menu={{
                  items: menuItems,
                  onClick: ({ key }) => {
                    // TODO: hook to your navigation/modals
                    // view -> open drawer
                    // edit -> open modal form
                    // remind -> trigger email or notification
                    // export -> download
                    console.log(key, r);
                  },
                }}
                trigger={["click"]}
              >
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          );
        },
      },
    ];
  }, []);

  const load = async (
    nextPage = page,
    nextPageSize = pageSize,
    nextFilters = filters,
  ) => {
    setLoading(true);
    try {
      const res = await fetchVisaList({
        page: nextPage,
        pageSize: nextPageSize,
        filters: nextFilters,
      });
      setRows(res.items || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

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
          style={{ width: 280 }}
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
      <Table
        rowKey={(r) => r._id || r.userId}
        loading={loading}
        columns={columns}
        dataSource={rows}
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
    </Card>
  );
}
