import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Alert, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../features/auth/authSlice';
import api from '../services/api';

const { Title, Paragraph } = Typography;

function HomePage() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Employee') {
        setLoading(true);
        try {
          // Fetch onboarding status
          const statusResponse = await api.get('/onboarding/status');
          setApplicationStatus(statusResponse.data.status);
          setFeedback(statusResponse.data.feedback || '');

          // Fetch profile for visa document status
          try {
            const profileResponse = await api.get('/info/profile');
            setProfile(profileResponse.data);
          } catch (profileError) {
            console.log('Profile not found, user might not be approved yet');
          }
        } catch (error) {
          console.error('Error fetching status:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Render status alert for employees
  const renderStatusAlert = () => {
    if (!applicationStatus || user?.role !== 'Employee') return null;

    // Rejected - Show HR feedback
    if (applicationStatus === 'Rejected' && feedback) {
      return (
        <Alert
          message="⚠️ Application Rejected"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                <strong>HR Feedback:</strong> {feedback}
              </p>
              <Button type="primary" danger onClick={() => navigate('/onboarding')}>
                Revise and Resubmit Application
              </Button>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      );
    }

    // Pending - Waiting for approval
    if (applicationStatus === 'Pending') {
      return (
        <Alert
          message="⏳ Application Under Review"
          description="Your onboarding application is currently being reviewed by HR. Please wait for approval."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      );
    }

    // Approved - Check OPT document status
    if (applicationStatus === 'Approved') {
      const optReceiptStatus = profile?.visaDocuments?.optReceipt?.status;
      const optEadStatus = profile?.visaDocuments?.optEad?.status;

      // If OPT Receipt is pending or not uploaded
      if (!optReceiptStatus || optReceiptStatus === 'pending') {
        return (
          <Alert
            message="📄 OPT Receipt Pending"
            description={
              <div>
                <p>Waiting for HR to approve your OPT Receipt.</p>
                {!optReceiptStatus && (
                  <Button type="primary" onClick={() => navigate('/visaStatus')}>
                    Upload OPT Receipt
                  </Button>
                )}
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      // If OPT Receipt is approved, prompt for OPT EAD
      if (optReceiptStatus === 'approved' && (!optEadStatus || optEadStatus === 'pending')) {
        return (
          <Alert
            message="✅ OPT Receipt Approved"
            description={
              <div>
                <p>Your OPT Receipt has been approved! Please upload a copy of your OPT EAD.</p>
                <Button type="primary" onClick={() => navigate('/visaStatus')}>
                  Upload OPT EAD
                </Button>
              </div>
            }
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      // All documents approved or in review
      if (optEadStatus === 'approved') {
        return (
          <Alert
            message="🎉 All Documents Approved"
            description="Your OPT documents have been approved. You're all set!"
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }

      if (optEadStatus === 'pending') {
        return (
          <Alert
            message="⏳ OPT EAD Under Review"
            description="Your OPT EAD is being reviewed by HR. Please wait for approval."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        );
      }
    }

    // Never Submitted
    if (applicationStatus === 'Never Submitted') {
      return (
        <Alert
          message="📝 Action Required"
          description={
            <div>
              <p>You haven't submitted your onboarding application yet.</p>
              <Button type="primary" onClick={() => navigate('/onboarding')}>
                Complete Onboarding Application
              </Button>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      );
    }

    return null;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>👋 Welcome, {user?.username}!</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Welcome to the Employee Management System
        </Paragraph>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        )}

        {!loading && renderStatusAlert()}
        
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
                  <Button 
                    type="link" 
                    onClick={() => navigate('/personInformation')}
                    disabled={applicationStatus !== 'Approved'}
                    title={applicationStatus !== 'Approved' ? 'Available after onboarding approval' : ''}
                  >
                    👤 View/Update Personal Information
                  </Button>
                  {applicationStatus !== 'Approved' && (
                    <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                      (Available after onboarding approval)
                    </span>
                  )}
                </li>
                <li>
                  <Button 
                    type="link" 
                    onClick={() => navigate('/visaStatus')}
                    disabled={applicationStatus !== 'Approved'}
                    title={applicationStatus !== 'Approved' ? 'Available after onboarding approval' : ''}
                  >
                    📄 Check Visa Status
                  </Button>
                  {applicationStatus !== 'Approved' && (
                    <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                      (Available after onboarding approval)
                    </span>
                  )}
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