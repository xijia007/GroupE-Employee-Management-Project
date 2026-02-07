import React from "react";
import { Steps } from "antd";
import { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import NameSection from "./section/nameSection";
import AddressSection from "./section/addressSection";
import ContactSection from "./section/contactSection";
import VisaInformationSection from "./section/visaInformationSection";
import EmergencySection from "./section/EmergencySection";
import UploadDocument from "./section/uploadDocument";
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
  Space,
  Switch,
  Table,
  TreeSelect,
  Upload,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";

// Backend API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * PersonInformation Component
 * Displays and allows editing of employee profile information from Profile database
 *
 * @param {string} userId - Current user's ID (for employees viewing their own profile)
 * @param {string} onboardingApplicationId - Application ID (for HR viewing specific employee - currently not used, reads from Profile)
 */
function PersonInformation({ userId, onboardingApplicationId }) {
  const [componentSize, setComponentSize] = useState("default");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  // Transform profile data to form values
  const transformProfileData = (data) => {
    if (!data) return {};

    console.log("=== Transform Profile Data ===");
    console.log("Raw SSN:", data.ssn);
    console.log("Raw dateOfBirth:", data.dateOfBirth);
    console.log("Raw gender:", data.gender);

    const transformed = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      preferredName: data.preferredName || "",
      email: data.email,
      ssn: data.ssn,
      dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
      gender: data.gender,
      profile_picture: data.profile_picture || "",

      // Address (Profile uses 'address' directly, same as form)
      address: {
        building: data.address?.building,
        street: data.address?.street,
        city: data.address?.city,
        state: data.address?.state,
        zip: data.address?.zip,
      },

      // Contact info (Profile uses 'contactInfo', same as form)
      contactInfo: {
        cellPhone: data.contactInfo?.cellPhone,
        workPhone: data.contactInfo?.workPhone,
      },

      // Visa information (Profile uses 'visaInformation', same as form)
      visaInformation: {
        visaType: data.visaInformation?.visaType,
        StartDate: data.visaInformation?.StartDate
          ? dayjs(data.visaInformation.StartDate)
          : null,
        EndDate: data.visaInformation?.EndDate
          ? dayjs(data.visaInformation.EndDate)
          : null,
      },

      // Emergency contacts (ensure array has at least empty object for form)
      emergencyContacts:
        data.emergencyContacts && data.emergencyContacts.length > 0
          ? data.emergencyContacts
          : [{}],

      // Documents (database stores URLs as strings)
      documents: data.documents || {
        driverLicense: "",
        workAuthorization: "",
        other: "",
      },
    };

    return transformed;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      console.log("PersonInformation props:", {
        userId,
        onboardingApplicationId,
      });

      if (!userId && !onboardingApplicationId) {
        console.log(
          "No userId or onboardingApplicationId provided, skipping data fetch",
        );
        return;
      }

      setLoading(true);
      try {
        let response;
        let url;

        // Fetch by user/profile ID (for both employee and HR viewing specific profile)
        if (userId || onboardingApplicationId) {
          url = `${API_URL}/info/profile`;
          console.log("Fetching user's profile:", url);
          response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
        }

        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Received profile data:", data);

          const formattedData = transformProfileData(data);
          console.log("Formatted data for form:", formattedData);
          form.setFieldsValue(formattedData);
          message.success("Personal information loaded successfully");
        } else {
          const errorText = await response.text();
          console.error("Response error:", errorText);
          message.warning("No profile found");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        message.error("Failed to load personal information");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, onboardingApplicationId, form]);

  const handleSubmit = async (values) => {
    try {
      console.log("Submitting form values:", values);

      const response = await fetch(`${API_URL}/info/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log("Profile updated:", updatedProfile);
        message.success("Information saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Update error:", errorData);
        message.error(errorData.message || "Failed to save information");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      message.error("Failed to save information");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large">
          <div style={{ marginTop: 8 }}>Loading personal information...</div>
        </Spin>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          marginBottom: 0,
          zIndex: 10,
        }}
      >
        <Radio.Group
          onChange={(e) => setComponentSize(e.target.value)}
          value={componentSize}
        >
          <Radio.Button value="small">Small</Radio.Button>
          <Radio.Button value="default">Default</Radio.Button>
          <Radio.Button value="large">Large</Radio.Button>
        </Radio.Group>
      </div>
      <Form
        form={form}
        labelWrap
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        initialValues={{ size: componentSize }}
        onValuesChange={onFormLayoutChange}
        onFinish={handleSubmit}
        size={componentSize}
        style={{ maxWidth: 1200, paddingTop: 50 }}
      >
        <NameSection />
        <AddressSection />
        <ContactSection />
        <VisaInformationSection />
        <EmergencySection />
        <UploadDocument />

        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Form.Item>
            <Button danger onClick={() => form.resetFields()}>
              Cancel
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
export default PersonInformation;
