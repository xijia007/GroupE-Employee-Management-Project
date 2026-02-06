import React from 'react';
import { Card, Typography, Button } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../features/auth/authSlice';

const { Title, Paragraph } = Typography;

function HomePage() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>👋 Welcome, {user?.username}!</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Welcome to the Employee Management System
        </Paragraph>
        
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Quick Links:</Title>
          <ul style={{ fontSize: '16px', lineHeight: '2' }}>
            {user?.role === 'Employee' && (
              <>
                <li>
                  <Button type="link" onClick={() => navigate('/onboarding')}>
                    📝 Complete Onboarding Application
                  </Button>
                </li>
                <li>
                  <Button type="link" onClick={() => navigate('/personInformation')}>
                    👤 View/Update Personal Information
                  </Button>
                </li>
                <li>
                  <Button type="link" onClick={() => navigate('/visaStatus')}>
                    📄 Check Visa Status
                  </Button>
                </li>
              </>
            )}
            
            {user?.role === 'HR' && (
              <>
                <li>
                  <Button type="link" onClick={() => navigate('/hr/hiring_management')}>
                    🔑 Hiring Management
                  </Button>
                </li>
                <li>
                  <Button type="link" onClick={() => navigate('/hr/employeeProfiles')}>
                    👥 Employee Profiles
                  </Button>
                </li>
                <li>
                  <Button type="link" onClick={() => navigate('/visaStatus')}>
                    📄 Visa Status Management
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default HomePage;