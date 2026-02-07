import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Space, Typography, Button, message, Statistic, Row, Col } from 'antd';
import { UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllEmployees } from '../../services/hrService';

const { Title, Text } = Typography;
const { Option } = Select;

function EmployeeProfilesPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');

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
  };

  const handleRefresh = () => {
    fetchEmployees(statusFilter);
    message.success('Employee list refreshed');
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff'}} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Full Name',
      key: 'fullName',
      render: (_, record) => {
        if (record.application) {
          return `${record.application.firstName} ${record.application.lastName}`; 
        }
        return <Text type='secondary'>Not Provided</Text>      
      },
    },
    {
      title: 'Onboarding Status',
      dataIndex: 'onboardingStatus',
      key: 'onboardingStatus',
      render: (status) => {
        let color = 'default';
        let text = status;

        switch (status) {
          case 'Pending':
            color = 'orange';
            text = 'Under Review';
            break;
          case 'Approved':
            color = 'green';
            text = 'Approved';
            break;          
          case 'Rejected':
            color = 'red';
            text = 'Rejected';
            break;          
          case 'Not Started':
            color = 'gray';
            text = 'Not Started';
            break;  
          default:
            color = 'default';       
        }

        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Submitted At',
      key: 'submittedAt',
      render: (_, record) => {
        if (record.application?.submittedAt) {
          return new Date(record.application.submittedAt).toLocaleDateString();
        }
        return <Text type='secondary'>-</Text>
      },
    },
    {
      title: 'Registered At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const getStatusCounts = () => {
    const counts = {
      total: employees.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      notStarted: 0,
    };

    employees.forEach((emp) => {
      switch (emp.onboardingStatus) {
        case 'Pending':
          counts.pending++;
          break;
        case 'Approved':
          counts.approved++;
          break;
        case 'Rejected':
          counts.rejected++;
          break;
        case 'Not Started':
          counts.notStarted++;
          break;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <Title level={2}>👥 Employee Profiles</Title>
      <Text type="secondary" style={{ fontSize: '16px' }}>
        View and manage all registered employees and their onboarding status
      </Text>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={statusCounts.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={statusCounts.pending}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Approved"
              value={statusCounts.approved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Not Started"
              value={statusCounts.notStarted}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>
      {/* 员工列表表格 */}
      <Card
        title={
          <Space>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Employee List</span>
            <Tag color="blue">{employees.length} employees</Tag>
          </Space>
        }
        extra={
          <Space>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ width: 180 }}
            >
              <Option value="All">All Statuses</Option>
              <Option value="NotStarted">Not Started</Option>
              <Option value="Pending">Pending Review</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={employees}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} employees`,
          }}
        />
      </Card>
    </div>
  )
}

export default EmployeeProfilesPage;