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
  console.log(
    "Person_information_page - User object keys:",
    user ? Object.keys(user) : "no user",
  );
  console.log("Person_information_page - User ID (_id):", user?._id);
  console.log("Person_information_page - User ID (id):", user?.id);
  console.log("Person_information_page - Direct access:", user && user._id);

  const userId = user?._id || user?.id;
  console.log("Person_information_page - Final userId:", userId);

  return <PersonInformation userId={userId} />;
}
export default PersonInformation_page;
