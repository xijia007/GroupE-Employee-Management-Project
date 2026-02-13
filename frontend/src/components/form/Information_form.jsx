import { useState, useEffect } from "react";
import NameSection from "./section/nameSection";
import AddressSection from "./section/addressSection";
import ContactSection from "./section/contactSection";
import VisaInformationSection from "./section/visaInformationSection";
import EmergencySection from "./section/EmergencySection";
import UploadDocument from "./section/uploadDocument";
import { Form, Radio, Spin, message } from "antd";
import dayjs from "dayjs";
import api from "../../services/api";

function PersonInformation({ userId, onboardingApplicationId }) {
  const [componentSize, setComponentSize] = useState("default");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [savedSectionValues, setSavedSectionValues] = useState({});

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  // Transform profile data to form values
  const transformProfileData = (data) => {
    if (!data) return {};

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
      if (!userId && !onboardingApplicationId) {
        console.log(
          "No userId or onboardingApplicationId provided, skipping data fetch",
        );
        return;
      }

      setLoading(true);
      try {
        // Current API reads current logged-in user's profile
        // (userId/onboardingApplicationId currently not used by backend route)
        const res = await api.get("/info/profile");
        const data = res.data;
        console.log("Received profile data:", data);

        const formattedData = transformProfileData(data);
        console.log("Formatted data for form:", formattedData);
        form.setFieldsValue(formattedData);
        setSavedSectionValues({
          name: {
            firstName: formattedData.firstName,
            middleName: formattedData.middleName,
            lastName: formattedData.lastName,
            preferredName: formattedData.preferredName,
            email: formattedData.email,
            profile_picture: formattedData.profile_picture,
            ssn: formattedData.ssn,
            dateOfBirth: formattedData.dateOfBirth,
            gender: formattedData.gender,
          },
          address: { address: formattedData.address },
          contact: { contactInfo: formattedData.contactInfo },
          visa: { visaInformation: formattedData.visaInformation },
          emergency: { emergencyContacts: formattedData.emergencyContacts },
          documents: { documents: formattedData.documents },
        });
        message.success("Personal information loaded successfully");
      } catch (error) {
        console.error("Error fetching profile data:", error);
        message.error(
          error?.response?.data?.message ||
            "Failed to load personal information",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, onboardingApplicationId, form]);

  const normalizeProfilePayload = (values) => {
    const input = values ?? {};
    const normalized = {
      ...input,
      address: input.address ? { ...input.address } : input.address,
      contactInfo: input.contactInfo
        ? { ...input.contactInfo }
        : input.contactInfo,
      visaInformation: input.visaInformation
        ? { ...input.visaInformation }
        : input.visaInformation,
      documents: input.documents ? { ...input.documents } : input.documents,
      emergencyContacts: Array.isArray(input.emergencyContacts)
        ? input.emergencyContacts.map((c) => ({ ...c }))
        : input.emergencyContacts,
    };

    // AntD DatePicker returns Dayjs; convert to ISO strings for API
    if (dayjs.isDayjs(normalized.dateOfBirth)) {
      normalized.dateOfBirth = normalized.dateOfBirth.toISOString();
    }
    if (dayjs.isDayjs(normalized.visaInformation?.StartDate)) {
      normalized.visaInformation.StartDate =
        normalized.visaInformation.StartDate.toISOString();
    }
    if (dayjs.isDayjs(normalized.visaInformation?.EndDate)) {
      normalized.visaInformation.EndDate =
        normalized.visaInformation.EndDate.toISOString();
    }

    return normalized;
  };

  const handleSubmit = async (values) => {
    try {
      console.log("Submitting form values:", values);
      const payload = normalizeProfilePayload(values);
      const res = await api.put("/info/profile", payload);
      console.log("Profile updated:", res.data);
      message.success("Information saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      message.error(
        error?.response?.data?.message || "Failed to save information",
      );
      throw error;
    }
  };

  const sectionConfig = {
    name: {
      validateFields: [
        "firstName",
        "middleName",
        "lastName",
        "preferredName",
        "email",
        "profile_picture",
        "ssn",
        "dateOfBirth",
        "gender",
      ],
      buildPayload: (allValues) => ({
        firstName: allValues.firstName,
        middleName: allValues.middleName,
        lastName: allValues.lastName,
        preferredName: allValues.preferredName,
        email: allValues.email,
        profile_picture: allValues.profile_picture,
        ssn: allValues.ssn,
        dateOfBirth: allValues.dateOfBirth,
        gender: allValues.gender,
      }),
    },
    address: {
      validateFields: [
        ["address", "street"],
        ["address", "building"],
        ["address", "city"],
        ["address", "state"],
        ["address", "zip"],
      ],
      buildPayload: (allValues) => ({ address: allValues.address }),
    },
    contact: {
      validateFields: [
        ["contactInfo", "cellPhone"],
        ["contactInfo", "workPhone"],
      ],
      buildPayload: (allValues) => ({ contactInfo: allValues.contactInfo }),
    },
    visa: {
      validateFields: [
        ["visaInformation", "visaType"],
        ["visaInformation", "StartDate"],
        ["visaInformation", "EndDate"],
      ],
      buildPayload: (allValues) => ({
        visaInformation: allValues.visaInformation,
      }),
    },
    emergency: {
      validateFields: [
        ["emergencyContacts", 0, "firstName"],
        ["emergencyContacts", 0, "middleName"],
        ["emergencyContacts", 0, "lastName"],
        ["emergencyContacts", 0, "relationship"],
        ["emergencyContacts", 0, "phone"],
        ["emergencyContacts", 0, "email"],
      ],
      buildPayload: (allValues) => ({
        emergencyContacts: allValues.emergencyContacts,
      }),
    },
    documents: {
      validateFields: [
        ["documents", "driverLicense"],
        ["documents", "workAuthorization"],
        ["documents", "other"],
      ],
      buildPayload: (allValues) => ({ documents: allValues.documents }),
    },
  };

  const handleSectionCancel = (sectionKey) => {
    const cfg = sectionConfig[sectionKey];
    const snapshot = savedSectionValues?.[sectionKey];

    if (snapshot) {
      form.setFieldsValue(snapshot);
    } else {
      form.resetFields(cfg.validateFields);
    }
    message.info("Changes discarded");
  };

  const handleSectionSave = async (sectionKey) => {
    const cfg = sectionConfig[sectionKey];

    await form.validateFields(cfg.validateFields);
    const allValues = form.getFieldsValue(true);
    const partial = cfg.buildPayload(allValues);
    const payload = normalizeProfilePayload(partial);

    const res = await api.put("/info/profile", payload);
    console.log("Profile updated:", res.data);
    setSavedSectionValues((prev) => ({ ...prev, [sectionKey]: partial }));
    message.success("Information saved successfully");
  };

  const getSectionButtonProps = (sectionKey) => ({
    onSave: () => handleSectionSave(sectionKey),
    onCancel: () => handleSectionCancel(sectionKey),
  });

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
      <div style={{ maxWidth: 1200, width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
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
          style={{ width: "100%" }}
        >
          <NameSection sectionButtonProps={getSectionButtonProps("name")} />
          <AddressSection
            sectionButtonProps={getSectionButtonProps("address")}
          />
          <ContactSection
            sectionButtonProps={getSectionButtonProps("contact")}
          />
          <VisaInformationSection
            sectionButtonProps={getSectionButtonProps("visa")}
          />
          <EmergencySection
            sectionButtonProps={getSectionButtonProps("emergency")}
          />
          <UploadDocument
            sectionButtonProps={getSectionButtonProps("documents")}
          />
        </Form>
      </div>
    </div>
  );
}
export default PersonInformation;
