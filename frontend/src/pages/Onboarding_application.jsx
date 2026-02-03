import React from "react";
import OnboardingForm from "../components/form/onboarding_form.jsx";
import { Steps } from "antd";

const items = [
  {
    title: "Submitting application",
    content: "You have completed this step.",
  },
  {
    title: "In Process",
    content: "Your application is being processed.",
  },
  {
    title: "Pending Approval",
    content: "Your application is waiting for approval.",
  },
];

function OnboardingApplication() {
  return (
    <>
      <Steps
        current={0}
        status="process"
        titlePlacement="vertical"
        items={items}
        ellipsis
      />
      <OnboardingForm />
    </>
  );
}
export default OnboardingApplication;
