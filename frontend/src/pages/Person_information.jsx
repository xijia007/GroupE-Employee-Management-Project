import React from "react";
import { useSelector } from "react-redux";
import PersonInformation from "../components/form/Information_form.jsx";

import {
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
} from "antd";

function PersonInformation_page() {
  // Get current user from Redux store
  const user = useSelector((state) => state.auth.user);

  console.log("Person_information_page - User from Redux:", user);

  const userId = user?._id || user?.id;

  return <PersonInformation userId={userId} />;
}
export default PersonInformation_page;
