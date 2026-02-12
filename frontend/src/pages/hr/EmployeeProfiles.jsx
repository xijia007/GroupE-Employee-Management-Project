import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Space, Typography, Button, message, Statistic, 
Row, Col, Empty, Input } from 'antd';
import { UserOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllEmployees } from '../../services/hrService';

const { Title, Text } = Typography;
const { Option } = Select;

function EmployeeProfilesPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');

  const normalizeStatus = (value) =>
    (value || '').replace(/\s+/g, '').toLowerCase();

  useEffect(() => {
    fetchEmployees(statusFilter);
  }, [statusFilter]);

  const fetchEmployees = async (status) => {
    try {
      setLoading(true);
      const data = await getAllEmployees(status);
      setEmployees(data.employees || []);

    } catch (err) {
      console.error('Error fetching employees', err);
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setSearchKeyword('');
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleRefresh = () => {
    setSearchKeyword('');
    fetchEmployees(statusFilter);
    message.success('Employee list refreshed');
  };

  // Handle name click - open employee detail in new tab
  const handleNameClick = (employeeId) => {
    window.open(`/hr/employee/${employeeId}`, '_blank');
  }

  // Filter employees by search keyword (client-side)
  const getFilteredEmployees = () => {
    if (searchKeyword.trim() === '') {
      return employees;
    }

    const keyword = searchKeyword.toLowerCase().trim();
    return employees.filter(emp => {
      const firstName = (emp.firstName || '').toLowerCase();
      const lastName = (emp.lastName || '').toLowerCase();
      const preferredName = (emp.preferredName || '').toLowerCase();

      return firstName.includes(keyword) || 
             lastName.includes(keyword) || 
             preferredName.includes(keyword);
    });
  };

  const filteredEmployees = getFilteredEmployees();

  const getStatusCounts = () => {
    const counts = {
      total: employees.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    employees.forEach((emp) => {
      const authTitle = emp.workAuthorizationTitle;
      
      // Pending: Form Pending OR Visa Pending
      if (authTitle === 'Onboarding Review Needed' || authTitle === 'Visa Status Management') {
          counts.pending++;
      }
      
      // Approved: Must be fully Active
      if (authTitle === 'Active' || authTitle === 'Active (Citizen/GC)') {
          counts.approved++;
      }
      
      // Rejected
      if (authTitle === 'Onboarding Rejected') {
          counts.rejected++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Table columns definition
  const columns = [
    {
      title: 'Name',
      key: 'fullName',
      render: (_, record) => (
        record.fullName !== 'N/A' ? (
          <a
            onClick={() => handleNameClick(record._id)}
            style={{
              color: '#1890ff', 
              cursor: 'pointer',
              fontWeight: 600 
            }}
          >
            {record.fullName}
          </a>
        ) : (
          <Text type="secondary">N/A</Text>
        )
      ),
      sorter: (a, b)=> {
        const nameA = a.lastName.toLowerCase() || '';
        const nameB = b.lastName.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      },
      defaultSortOrder: 'ascend',// Default A-Z by last name
    },
    {
      title: 'SSN',
      dataIndex: 'ssn',
      key: 'ssn',
      render: (ssn) => {
        // Mask SSN for privacy: XXX-XX-1234
        if (ssn && ssn !== 'N/A' && ssn.length >= 4) {
          return `XXX-XX-${ssn.slice(-4)}`;
        }
      },
    },

    {
      title: 'Work Authorization',
      dataIndex: 'visaTitle',
      key: 'visaTitle',
      render: (visaTitle) => visaTitle || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },

  ];

  // Render search results status
  const renderSearchStatus = () => {
    if (searchKeyword.trim() === '') {
      return null;
    }

    const count = filteredEmployees.length;

    if (count === 0) {
      return (
        <div
          style={{ 
          padding: '12px 16px', 
          background: '#fff7e6', 
          border: '1px solid #ffd591',
          borderRadius: '4px',
          marginBottom: 16 
          }}>
          <Text type='warning'>
            ⚠️ No employees found matching "{searchKeyword}"
          </Text>
        </div>
      );
    }

    if (count === 1) {
      return (
        <div style={{ 
          padding: '12px 16px', 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          marginBottom: 16 
        }}>
          <Text type="success">
            ✅ Found 1 employee matching "{searchKeyword}"
          </Text>
        </div>
      );
    }

    return (
      <div style={{
        padding: '12px 16px', 
        background: '#e6f7ff', 
        border: '1px solid #91d5ff',
        borderRadius: '4px',
        marginBottom: 16       
      }}>
        <Text style={{ color: '#1890ff' }}>
          📋 Found {count} employees matching "{searchKeyword}"
        </Text>
      </div>
    );
  };

  const pageStyle = {
    padding: 'clamp(16px, 2vw, 24px)',
    maxWidth: '1600px',
    margin: '0 auto',
  };

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 16px' }}>
        <Title level={2} style={{ margin: 0 }}>👥 Employee Profiles</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          View and manage all registered employees and their onboarding status
        </Text>
      </div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Employees"
              value={statusCounts.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Pending Review"
              value={statusCounts.pending}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Approved"
              value={statusCounts.approved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
      {/* Employee List Card */}
      <Card
        title={
          <Space>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>Employee List</span>
          </Space>
        }
      >
        <Row gutter={[8, 8]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ width: '100%' }}
            >
              <Option value="All">All Statuses</Option>
              <Option value="Not Started">Not Started</Option>
              <Option value="Pending">Pending Review</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={10} lg={10}>
            <Input
              placeholder="Search by name..."
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={handleSearchChange}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={24} md={6} lg={4}>
            <Button block icon={<ReloadOutlined />} onClick={handleRefresh}>
              Refresh
            </Button>
          </Col>
        </Row>
        
        {/* Search Status Alert */}
        {renderSearchStatus()}

        {/* Employee Table */}
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          tableLayout="auto"
          locale={{
            emptyText: searchKeyword.trim() 
              ? <Empty description={`No employees found matching "${searchKeyword}"`} />
              : <Empty description="No employees in this status" />
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} employees`,
          }}
        />
      </Card>
    </div>
  )
}

export default EmployeeProfilesPage;
