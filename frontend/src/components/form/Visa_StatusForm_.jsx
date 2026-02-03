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
    title: "Waiting",
    content: "Your application is waiting for approval.",
  },
];

function Visa_StatusForm_() {
  return (
    <Steps
      current={0}
      status="process"
      titlePlacement="vertical"
      items={items}
      ellipsis
    />
  );
}
export default Visa_StatusForm_;
