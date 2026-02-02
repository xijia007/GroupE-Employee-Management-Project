import { Layout } from "antd";
import React from "react";

const { Footer } = Layout;
const footerStyle = {
  textAlign: "center",
  color: "#000",
  backgroundColor: "#fff",
};

function FooterComponent() {
  return <Footer style={footerStyle}>Footer</Footer>;
}
export default FooterComponent;
