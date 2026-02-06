import { Steps, Card, Alert, Spin, message } from "antd";
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Cascader,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  TreeSelect,
  Upload,
} from "antd";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSlice";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const config = {
  rules: [{ type: "object", required: true, message: "Please select time!" }],
};

function OnboardingForm({ initialData = null, onSubmit, isResubmission = false }) {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [fileList, setFileList] = useState({
    driverLicense: [],
    workAuthorization: [],
    other: []
  });

  const profileUrl = Form.useWatch("profilePicture", form);
  const usResident = Form.useWatch("usResident", form);
  const IsReference = Form.useWatch("IsReference", form);

  useEffect(() => {
    if (initialData) {
      const formData = {
        ...initialData,
        dateOfBirth: initialData.dateOfBirth ? dayjs(initialData.dateOfBirth) : null,
        visaStartDate: initialData.visaStartDate ? dayjs(initialData.visaStartDate) : null,
        visaEndDate: initialData.visaEndDate ? dayjs(initialData.visaEndDate) : null,
        workAuthRange: initialData.visaStartDate && initialData.visaEndDate
          ? [dayjs(initialData.visaStartDate), dayjs(initialData.visaEndDate)]
          : null,
      };
      form.setFieldsValue(formData);
    }
  }, [initialData, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(values).forEach(key => {
        if (key === 'dateOfBirth') {
          if (values[key]) {
            formData.append(key, values[key].toISOString());
          } 
        } else if (key === 'workAuthRange') {
            if (values[key] && values[key].length === 2) {
              formData.append('visaStartDate', values[key][0].toISOString());
              formData.append('visaEndDate', values[key][1].toISOString());
            }
        } else if (key === 'currentAddress') {
          formData.append(key, JSON.stringify(values[key]));
        } else if (key === 'emergencyContacts') {
          formData.append(key, JSON.stringify(values[key]));
        } else if (key === 'reference') {
          const emergencyContact = {
            firstName: values.reference?.firstName || '',
            middleName: values.reference?.middleName || '',
            lastName: values.reference?.lastName || '',
            phone: values.reference?.phone || '',
            email: values.reference?.email || '',
            relationship: values.reference?.relationship || ''
          };
          formData.append('emergencyContacts', JSON.stringify([emergencyContact]));
        } else if (key !== 'size' && key !== 'profilePicture' && key !== 'optReceipt' && key !== 'IsReference') {
          if (values[key] !== undefined && values[key] !== null) {
            formData.append(key, values[key]);
          }
        }
      });

      if (fileList.driverLicense && fileList.driverLicense.length > 0) {
        formData.append('driverLicense', fileList.driverLicense[0].originFileObj);
      }
      if (fileList.workAuthorization && fileList.workAuthorization.length > 0) {
        formData.append('workAuthorization', fileList.workAuthorization[0].originFileObj);
      }
      if (fileList.other && fileList.other.length > 0) {
        formData.append('other', fileList.other[0].originFileObj);
      }

      if (onSubmit) {
        await onSubmit(formData);
        message.success(isResubmission 
          ? 'Application resubmitted successfully!' 
          : 'Application submitted successfully!');
      }

    } catch (err) {
      console.error('Form submission error:', err);
      message.error('Submission failed. Please check your form and try again.');

    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return false;
    }
    return false;
  };

  const handleFileChange = (type) => (info) => {
    setFileList(prev => ({
      ...prev,
      [type]: info.fileList
    }));
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <Form
        form={form}
        labelWrap
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        onFinish={handleSubmit}
        size="default"
        style={{ maxWidth: 1200, width: '100%' }}
      >
        <Form.Item 
          label="Name" 
          required
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="firstName" 
                rules={[{ required: true, message: 'First name is required'}]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item 
                name="middleName" 
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Middle Name (Optional)" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item 
                name="lastName" 
                rules={[{ required: true, message: 'Last name is required'}]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label="Preferred Name">
          <Input placeholder="Optional" />
        </Form.Item>

        <Form.Item name="profilePicture" label="Profile picture">
          <Input
            placeholder="https://..."
            addonAfter={
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <span style={{ fontSize: 12, color: "#999" }}>—</span>
                )}
              </div>
            }
          />
        </Form.Item>

        <Form.Item 
          label="Email"
          name='email'
          required
          rules={[
            { required: true, message: 'Email is required'},
            { type: 'email', message: 'Please enter a valid email'}
          ]}
        >
          <Input placeholder="your.email@example.com"/>
        </Form.Item>

        <Form.Item 
          label="Social Security Number (SSN)"
          name='ssn'
          required
          rules={[
            { required: true, message: 'SSN is required'},
            { pattern: /^\d{3}-\d{2}-\d{4}$/, message: 'Format: XXX-XX-XXXX'}
          ]}
        >
          <Input placeholder="XXX-XX-XXXX" />
        </Form.Item>

        <Form.Item
          name='dateOfBirth'
          label='Date of Birth'
          required
          rules={[{ required: true, message: 'Date of birth is required'}]}
        >
          <DatePicker style={{ width: '100%'}} format='YYYY-MM-DD'/>
        </Form.Item>

        <Form.Item 
          label="Gender" 
          name='gender' 
          required
          rules={[{ required: true, message: 'Gender is required'}]}
        >
          <Select
            placeholder='Select Gender'
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "I do not wish to answer", value: "I do not wish to answer" },
            ]}
          />
        </Form.Item>

        <Form.Item label='Current Address' required style={{ marginBottom: 24}}>
          <Form.Item
            name={['currentAddress', 'building']}
            rules={[{ required: true, message: 'Building/Apt is required' }]}
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="Building/Apartment Number"/>
          </Form.Item>

          <Form.Item
            name={['currentAddress', 'street']}
            rules={[{ required: true, message: 'Street is required' }]}
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="Street Address"/>
          </Form.Item>

          <Row gutter={16} style={{ marginBottom: 0 }}>
            <Col span={8}>
              <Form.Item
                name={['currentAddress', 'city']}
                rules={[{ required: true, message: 'City required'}]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="City"/>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name={['currentAddress', 'state']}
                rules={[{ required: true, message: 'State required'}]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="State"/>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name={['currentAddress', 'zip']}
                rules={[
                  { required: true, message: 'Zip required'},
                  { pattern: /^\d{5}$/, message: '5 digits'}
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Zip Code"/>
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item
          label='Cell Phone'
          name='cellPhone'
          required
          rules={[
            {required: true, message: 'Cell phone is required'},
            { pattern: /^\d{3}-\d{3}-\d{4}$/, message: 'Format: XXX-XXX-XXXX'}
          ]}
        >
          <Input placeholder="XXX-XXX-XXXX"/>
        </Form.Item>

        <Form.Item
          label='Work Phone'
          name='workPhone'
        >
          <Input placeholder="XXX-XXX-XXXX (Optional)"/>
        </Form.Item>

        {/* US Citizen or Permanent Resident Selection */}
        <Form.Item
          name="usResident"
          label="Citizen or PR of U.S.?"
          required
          rules={[{ required: true, message: "Please select your status" }]}
        >
          <Select
            placeholder="Select"
            options={[
              { label: "US Citizen", value: "usCitizen" },
              { label: "Green Card", value: "greenCard" },
              { label: "Work Authorization (Visa)", value: "workAuth" }
            ]}
          />
        </Form.Item>

        {/* Only show visa fields if user selected "Work Authorization" */}
        {usResident === "workAuth" && (
          <>
            <Form.Item
              name='visaTitle'
              label='Visa Type'
              required
              rules={[{ required: true, message: 'Visa type is required'}]}
            >
          <Select 
            placeholder='Select Visa Type'
            options={[
              { label: 'H1-B', value: 'H1-B'},
              { label: 'L2', value: 'L2'},
              { label: 'F1(CPT/OPT)', value: 'F1(CPT/OPT)'},
              { label: 'H4', value: 'H4'},
              { label: 'Other', value: 'Other'}
            ]}
          />
        </Form.Item>

        <Form.Item
          name='workAuthRange'
          label='Visa Validity Period'
          required
          rules={[
            {
              type: 'array',
              required: true, 
              message: 'Please select visa validity period'
            }
          ]}
        >
          <DatePicker.RangePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
        </Form.Item>
          </>
        )}

        <Form.Item
          name="IsReference"
          label="Emergency Contact"
          required
          rules={[{ required: true, message: "Please specify if you have an emergency contact" }]}
        >
          <Select
            placeholder="Select"
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
          />
        </Form.Item>

        {IsReference === "yes" && (
          <Form.Item label=" " colon={false}>
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 10,
                padding: 16,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Emergency Contact Information
              </div>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name={["reference", "firstName"]}
                    rules={[{ required: true, message: "First name required" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="First Name" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["reference", "middleName"]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="Middle Name (Optional)" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["reference", "lastName"]}
                    rules={[{ required: true, message: "Last name required" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name={["reference", "relationship"]}
                    rules={[
                      { required: true, message: "Relationship required" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Relationship" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["reference", "phone"]}
                    rules={[{ required: true, message: "Phone required" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Phone Number" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["reference", "email"]}
                    rules={[
                      { required: true, message: "Email required" },
                      { type: "email", message: "Invalid email" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Email" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form.Item>
        )}

        <Form.Item label='Driver License'>
          <Upload
            fileList={fileList.driverLicense}
            beforeUpload={beforeUpload}
            onChange={handleFileChange('driverLicense')}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Driver License</Button>
          </Upload>
        </Form.Item>

        <Form.Item label='Work Authorization Document'>
          <Upload
            fileList={fileList.workAuthorization}
            beforeUpload={beforeUpload}
            onChange={handleFileChange('workAuthorization')}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Work Authorization</Button>
          </Upload>
        </Form.Item>

        <Form.Item label='Other Documents'>
          <Upload
            fileList={fileList.other}
            beforeUpload={beforeUpload}
            onChange={handleFileChange('other')}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Other Documents</Button>
          </Upload>
        </Form.Item>

        <Form.Item wrapperCol={{ span: 14, offset: 4 }}>
          <Button
            type='primary'
            htmlType="submit"
            loading={loading}
            size="large"
          >
            {isResubmission ? 'Resubmit Application' : 'Submit Application'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default OnboardingForm;
