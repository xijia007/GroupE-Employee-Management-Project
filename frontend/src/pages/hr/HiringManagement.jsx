import React, { useState, useEffect } from 'react';
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
    Divider,
    List,
    Grid,
} from 'antd';
import { generateRegistrationToken, getAllTokens, getAllApplications } from '../../services/hrService';

// Destructuring Assignment, Used to extract attributes from an object.
const { Title, Text } = Typography; // Title: Heading component， Text: Text component 

const HiringManagement = () => {
    // Form instance for controlling form fields
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);

    const [tokens, setTokens] = useState([]);

    const [applications, setApplications] = useState([]);

    const [fetchingData, setFetchingData] = useState(false);
    const screens = Grid.useBreakpoint();
    
    useEffect(() => {
        fetchTokensAndApplications();
    }, []);

    const fetchTokensAndApplications = async () => {
        setFetchingData(true);

        try {
            const [tokensData, applicationsData] = await Promise.all([
                getAllTokens(),
                getAllApplications('All')
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
            key: 'status',
            render: (_, record) => {
                const info = getTokenStatusInfo(record);
                return <Tag color={info.color}>{info.text}</Tag>;
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleString() : '-',
        },
        {
            title: 'Expires At',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            render: (date) => date ? new Date(date).toLocaleString() : '-',
        },
        {
            title: 'Registration Link',
            dataIndex: 'registrationLink',
            key: 'registrationLink',
            render: (link, record) => {
                const info = getTokenStatusInfo(record);
                if (!link) return '-';
                
                return (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: info.text === 'Expired' ? 'gray' : undefined }}
                    >
                        {link}
                    </a>
                );
            }
        },
    ];

    const getTokenStatusInfo = (record) => {
        const now = new Date();
        const expiresAt = new Date(record.expiresAt);
        // Add a small buffer or strict comparison. 
        // Note: record.expiresAt from DB is ISO string.
        const isExpired = now > expiresAt;

        // Check explicit status first if available, otherwise infer
        if (record.status === 'Submitted' || record.onboardingSubmitted) {
            return { text: 'Submitted', color: 'green' };
        }
        if (isExpired) {
            return { text: 'Expired', color: 'red' };
        }
        return { text: 'Sent (Active)', color: 'blue' };
    };

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
            title: 'Submitted At',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'View Application',
            key: 'action',
            render: (_, record) => (
                <Button
                    type='link'
                    size='small'
                    onClick={() => window.open(`/hr/application-review/${record._id}`, '_blank')}
                >
                    View
                </Button>
            )
        }
    ];

    const pendingApplications = applications.filter((app) => app.status === 'Pending');
    const rejectedApplications = applications.filter((app) => app.status === 'Rejected');
    const approvedApplications = applications.filter((app) => app.status === 'Approved');

    return (
        <div style={{padding: 'clamp(16px, 2vw, 24px)', maxWidth: '1400px', margin: '0 auto'}}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 16px' }}>
                <Title level={2} style={{ margin: 0 }}>Hiring Management</Title>
                <Text type='secondary'>
                    Generate registration tokens and manage onboarding applications
                </Text>
            </div>

            <Divider />

            <Card title='Generate Registration Token' style={{ marginBottom: '24px'}}>
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={handleGenerateToken}
                    autoComplete='off'
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
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
                    </div>

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
                        <Tag color='orange'>{pendingApplications.length}</Tag>
                    </Space>
                }
                style={{ marginBottom: '24px'}}
            >
                {screens.md ? (
                    <Table 
                        dataSource={pendingApplications}
                        columns={applicationColumns}
                        rowKey='_id'
                        loading={fetchingData}
                        scroll={{ x: 'max-content' }}
                        tableLayout="auto"
                        pagination={{ pageSize: 5}}
                        locale={{ emptyText: 'No pending applications'}}
                    />
                ) : (
                    <List
                        dataSource={pendingApplications}
                        loading={fetchingData}
                        locale={{ emptyText: 'No pending applications'}}
                        pagination={{ pageSize: 5 }}
                        renderItem={(record) => (
                            <List.Item>
                                <Card size="small" style={{ width: '100%' }}>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Text strong>{record.firstName} {record.lastName}</Text>
                                        <Text type="secondary">{record.email}</Text>
                                        <Text type="secondary">
                                            Submitted {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : 'N/A'}
                                        </Text>
                                        <Button
                                            type='primary'
                                            size='small'
                                            onClick={() => window.open(`/hr/application-review/${record._id}`, '_blank')}
                                        >
                                            Review
                                        </Button>
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            <Card
                title={
                    <Space>
                        <span>Rejected Applications</span>
                        <Tag color='red'>{rejectedApplications.length}</Tag>
                    </Space>
                }
                style={{ marginBottom: '24px'}}
            >
                {screens.md ? (
                    <Table 
                        dataSource={rejectedApplications}
                        columns={applicationColumns}
                        rowKey='_id'
                        loading={fetchingData}
                        scroll={{ x: 'max-content' }}
                        tableLayout="auto"
                        pagination={{ pageSize: 5}}
                        locale={{ emptyText: 'No rejected applications'}}
                    />
                ) : (
                    <List
                        dataSource={rejectedApplications}
                        loading={fetchingData}
                        locale={{ emptyText: 'No rejected applications'}}
                        pagination={{ pageSize: 5 }}
                        renderItem={(record) => (
                            <List.Item>
                                <Card size="small" style={{ width: '100%' }}>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Text strong>{record.firstName} {record.lastName}</Text>
                                        <Text type="secondary">{record.email}</Text>
                                        <Text type="secondary">
                                            Submitted {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : 'N/A'}
                                        </Text>
                                        <Button
                                            type='link'
                                            size='small'
                                            onClick={() => window.open(`/hr/application-review/${record._id}`, '_blank')}
                                        >
                                            View
                                        </Button>
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            <Card
                title={
                    <Space>
                        <span>Approved Applications</span>
                        <Tag color='green'>{approvedApplications.length}</Tag>
                    </Space>
                }
                style={{ marginBottom: '24px'}}
            >
                {screens.md ? (
                    <Table 
                        dataSource={approvedApplications}
                        columns={applicationColumns}
                        rowKey='_id'
                        loading={fetchingData}
                        scroll={{ x: 'max-content' }}
                        tableLayout="auto"
                        pagination={{ pageSize: 5}}
                        locale={{ emptyText: 'No approved applications'}}
                    />
                ) : (
                    <List
                        dataSource={approvedApplications}
                        loading={fetchingData}
                        locale={{ emptyText: 'No approved applications'}}
                        pagination={{ pageSize: 5 }}
                        renderItem={(record) => (
                            <List.Item>
                                <Card size="small" style={{ width: '100%' }}>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Text strong>{record.firstName} {record.lastName}</Text>
                                        <Text type="secondary">{record.email}</Text>
                                        <Text type="secondary">
                                            Submitted {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : 'N/A'}
                                        </Text>
                                        <Button
                                            type='link'
                                            size='small'
                                            onClick={() => window.open(`/hr/application-review/${record._id}`, '_blank')}
                                        >
                                            View
                                        </Button>
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            <Card title='Token History'>
                {screens.md ? (
                    <Table 
                        dataSource={tokens}
                        columns={tokenColumns}
                        rowKey='_id'
                        loading={fetchingData}
                        scroll={{ x: 'max-content' }}
                        tableLayout="auto"
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: 'No tokens generated yet'}}
                    />
                ) : (
                    <List
                        dataSource={tokens}
                        loading={fetchingData}
                        locale={{ emptyText: 'No tokens generated yet'}}
                        pagination={{ pageSize: 10 }}
                        renderItem={(record) => (
                            <List.Item>
                                <Card size="small" style={{ width: '100%' }}>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Text strong>{record.email}</Text>
                                        <Text type="secondary">{record.name}</Text>
                                        <Text type="secondary">
                                            Created: {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A'}
                                        </Text>
                                        <Text type="secondary">
                                            Expires: {record.expiresAt ? new Date(record.expiresAt).toLocaleString() : 'N/A'}
                                        </Text>
                                        {record.registrationLink && (
                                            <a
                                                href={record.registrationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {record.registrationLink}
                                            </a>
                                        )}
                                        <Tag color={getTokenStatusInfo(record).color}>
                                            {getTokenStatusInfo(record).text}
                                        </Tag>
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    )
};

export default HiringManagement;
