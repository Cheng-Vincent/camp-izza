import React, { useState, useEffect } from "react";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";

const AdminYouth = () => {
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
            <h1 style={{ fontSize: "1.7rem", color: "#e2e4ee" }}>Youth</h1>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminYouth;
