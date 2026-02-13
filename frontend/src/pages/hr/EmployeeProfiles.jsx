import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Typography, message, Empty, Input, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getAllEmployees } from '../../services/hrService';

const { Title, Text } = Typography;

function EmployeeProfilesPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployees();
      setEmployees(data.employees || []);

    } catch (err) {
      console.error('Error fetching employees', err);
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
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
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        // Use workAuthorizationTitle calculated by backend
        const rawStatus = record.workAuthorizationTitle || record.onboardingStatus || 'Unknown';
        
        let color = 'default';
        let text = rawStatus;

        if (rawStatus === 'Active' || rawStatus.includes('Active')) {
          color = 'green';
          text = 'Approved'; 
        } else if (rawStatus === 'Visa Status Management') {
          color = 'orange';
          text = 'Visa Review';
        } else if (rawStatus === 'Onboarding Review Needed' || rawStatus === 'Pending') {
          color = 'blue';
          text = 'Application Pending';
        } else if (rawStatus.includes('Rejected')) {
          color = 'red';
          text = 'Rejected';
        } else if (rawStatus === 'Not Started' || rawStatus === 'Never Submitted') {
          color = 'default';
          text = 'Not Started';
        }

        return <Tag color={color}>{text}</Tag>;
      },
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
          Employee summary and profile search
        </Text>
      </div>
      {/* Employee List Card */}
      <Card
        title={
          <Space>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>Employee List</span>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by first name, last name, or preferred name..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={handleSearchChange}
            style={{ width: '100%' }}
            allowClear
          />
        </div>
        
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
              : <Empty description="No employees found" />
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
