import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Card, 
    Form, 
    Input, 
    Button, 
    Table, 
    message, 
    Tag, 
    Space,
    Typography,
    Divider 
} from 'antd';
import { generateRegistrationToken, getAllTokens, getAllApplications } from '../../services/hrService';

// Destructuring Assignment, Used to extract attributes from an object.
const { Title, Text } = Typography; // Title: Heading component， Text: Text component 

const HiringManagement = () => {
    // Form instance for controlling form fields
    const [form] = Form.useForm();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [tokens, setTokens] = useState([]);

    const [applications, setApplications] = useState([]);

    const [fetchingData, setFetchingData] = useState(false);
    
    useEffect(() => {
        fetchTokensAndApplications();
    }, []);

    const fetchTokensAndApplications = async () => {
        setFetchingData(true);

        try {
            const [tokensData, applicationsData] = await Promise.all([
                getAllTokens(),
                getAllApplications('Pending')
            ]);

            setTokens(tokensData.tokens || []);
            setApplications(applicationsData.applications || []);

        } catch (err) {
            console.error('Fetch data error:', err);
            message.error('Failed to load data');

        } finally {
            setFetchingData(false);

        }
    };

    const handleGenerateToken = async (values) => {
        setLoading(true);

        try {
            const result = await generateRegistrationToken(
                values.email,
                values.name
            );

            message.success(result.message || 'Registration token generated successfully!');

            form.resetFields();

            fetchTokensAndApplications();

        } catch (err) {
            console.error('Generate token error:', err);

            const errorMessage = err.response?.data?.message || 'Failed to generate registration token';

            message.error(errorMessage);

        } finally {
            setLoading(false);

        }
    };

    const tokenColumns = [
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => <Text strong>{email}</Text>
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colorMap = {
                    'Sent': 'blue',
                    'Submitted': 'green',
                    'Expired': 'red'
                };
                return <Tag color={colorMap[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Expires At',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
    ];

    const applicationColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <Text strong>{record.firstName} {record.lastName}</Text>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Username',
            key: 'username',
            render: (_, record) => record.user?.username || '-'
        },
        {
            title: 'Submitted At',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type='primary'
                    size='small'
                    onClick={() => navigate(`/hr/application-review/${record._id}`)}
                >
                    Review
                </Button>
            )
        }
    ];

    return (
        <div style={{padding: '24px', maxWidth: '1400px', margin: '0 auto'}}>
            <Title level={2}>Hiring Management</Title>
            <Text type='secondary'>
                Generate registration tokens and manage onboarding applications
            </Text>

            <Divider />

            <Card title='Generate Registration Token' style={{ marginBottom: '24px'}}>
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={handleGenerateToken}
                    autoComplete='off'
                >
                    <Form.Item
                        label='Employee Email'
                        name='email'
                        rules={[
                            {
                                required: true,
                                message: 'Please enter employee email'
                            },
                            {
                                type: 'email',
                                message: 'Please enter a valid email'
                            }
                        ]}
                    >
                        <Input 
                            placeholder='john.doe@example.com'
                            size='large'
                        />
                    </Form.Item>

                    <Form.Item
                        label="Employee Name"
                        name="name"
                        rules={[
                            { 
                                required: true, 
                                message: 'Please enter employee name' 
                            }
                        ]}
                    >
                        <Input 
                            placeholder="John Doe" 
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType='submit'
                            loading={loading}
                            size='large'
                            block
                        >
                            {loading ? 'Generating...': 'Generate & Send Email'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card
                title={
                    <Space>
                        <span>Pending Applications</span>
                        <Tag color='orange'>{applications.length}</Tag>
                    </Space>
                }
                style={{ marginBottom: '24px'}}
            >
                <Table 
                    dataSource={applications}
                    columns={applicationColumns}
                    rowKey='_id'
                    loading={fetchingData}
                    pagination={{ pageSize: 5}}
                    locale={{ emptyText: 'No pending applications'}}
                />
            </Card>

            <Card title='Token History'>
                <Table 
                    dataSource={tokens}
                    columns={tokenColumns}
                    rowKey='_id'
                    loading={fetchingData}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'No tokens generated yet'}}
                />
            </Card>
        </div>
    )
};

export default HiringManagement;

