import React, { useState, useEffect } from "react";
import OnboardingForm from "../components/form/onboarding_form.jsx";
import { Steps, Card, Spin, message } from "antd";
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import api from '../services/api';

const statusSteps = [
  {
    title: "Never Submitted",
    description: "Please fill out and submit your onboarding application."
  },
  {
    title: "Pending",
    description: "Your application is being reviewed by HR.",
  },
  {
    title: "Approved",
    description: "Your application has been approved! Welcome aboard!",
  },
  {
    title: "Rejected",
    description: "Your application needs revisions. Please update and resubmit.",
  },
];

const statusToStep = {
  'Never Submitted': 0,
  'Pending': 1,
  'Approved': 2,
  'Rejected': 3
};

function OnboardingApplication() {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState('Never Submitted');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const statusResponse = await api.get('/onboarding/status');
        setApplicationStatus(statusResponse.data.status);
        setFeedback(statusResponse.data.feedback || '');

        if (statusResponse.data.status !== 'Never Submitted') {
          const appResponse = await api.get('/onboarding/my-application');
          setApplicationData(appResponse.data.application);
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        message.error('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplication();
    }
  }, [user]);

  const handleSubmit = async (formData) => {
    try {
      const response = await api.post('/onboarding/submit', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setApplicationStatus('Pending');
      setApplicationData(response.data.application);
      
      message.success('Application submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      message.error('Failed to submit application. Please try again.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading...</div>
      </div>
    );
  }

  const currentStep = statusToStep[applicationStatus] || 0;
  const isRejected = applicationStatus === 'Rejected';

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          status={isRejected ? 'error' : 'process'}
          items={statusSteps}
        />
      </Card>

      {isRejected && feedback && (
        <Card 
          type="inner" 
          title="⚠️ Feedback from HR" 
          style={{ marginBottom: 24, borderColor: '#ff4d4f' }}
        >
          <p style={{ color: '#ff4d4f', fontSize: 16 }}>{feedback}</p>
          <p>Please revise your application according to the feedback above and resubmit.</p>
        </Card>
      )}

      {applicationStatus === 'Approved' && (
        <Card 
          type="inner" 
          title="🎉 Congratulations!" 
          style={{ marginBottom: 24, borderColor: '#52c41a', background: '#f6ffed' }}
        >
          <p style={{ color: '#52c41a', fontSize: 16 }}>
            Your onboarding application has been approved! Welcome to the team!
          </p>
        </Card>
      )}

      {applicationStatus === 'Pending' && (
        <Card 
          type="inner" 
          title="⏳ Under Review" 
          style={{ marginBottom: 24, borderColor: '#1890ff', background: '#e6f7ff' }}
        >
          <p style={{ color: '#1890ff', fontSize: 16 }}>
            Your application is currently being reviewed by HR. Please wait for approval.
          </p>
        </Card>
      )}

      {(applicationStatus === 'Never Submitted' || isRejected) && (
        <Card title={isRejected ? '📝 Resubmit Application' : '📝 Onboarding Application'}>
          <OnboardingForm
            initialData={applicationData}
            onSubmit={handleSubmit}
            isResubmission={isRejected}
          />
        </Card>
      )}

      {(applicationStatus === 'Approved' || applicationStatus === 'Pending') && (
        <Card title="📄 Your Application">
          <p style={{ color: '#888' }}>
            Your application has been submitted. You can view it once HR completes the review.
          </p>
        </Card>
      )}
    </div>
  );
}

export default OnboardingApplication;
