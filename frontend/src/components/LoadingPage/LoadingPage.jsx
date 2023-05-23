import React from "react";
import Spinner from "react-bootstrap/Spinner";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const LoadingPage = () => {
  return (
    <>
      <div className="text-center">
        <Row>
          <Col>
            <Spinner animation="border" role="status"></Spinner>
          </Col>
        </Row>
        <Row>
          <Col>Loading...</Col>
        </Row>
      </div>
    </>
  );
};

export default LoadingPage;
