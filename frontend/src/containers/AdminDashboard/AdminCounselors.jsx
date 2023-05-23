import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";
import "./AdminDashboard.css";
import AdminCounselorReview from "./AdminCounselorReview";
import AdminAssignCounselors from "./AdminAssignCounselors";

const AdminCounselors = () => {
  return (
    <div class="body pb-5">
      <Row className="mt-3">
        <HeaderLogo href="/admin" />
      </Row>
      <div className="admin-container mx-auto py-3 mb-5">
        <Row className="mx-auto mt-3">
          <Col className="text-left">
            <CustomButton text="Back" href="/admin" />
          </Col>
        </Row>
        <Row className="text-center mx-auto mb-4">
          <Col>
            <h1 style={{ fontSize: "1.7rem", color: "#e2e4ee" }}>Counselors</h1>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            <AdminCounselorReview />
          </Col>
          <Col>
            <AdminAssignCounselors />
          </Col>
        </Row>
        <Row className="mb-4"></Row>
      </div>
    </div>
  );
};

export default AdminCounselors;
