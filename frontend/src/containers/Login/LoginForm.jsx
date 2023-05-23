import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";

const LoginForm = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  Axios.defaults.withCredentials = true;

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      login();
    }
    setValidated(true);
  };

  const login = () => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/login", {
      email: loginEmail,
      password: loginPassword,
    })
      .catch((error) => {
        console.log(error);
      })
      .then((res) => {
        if (!res.data.auth) {
          setErrorMessage(res.data.message);
          setValidated(false);
        } else {
          setErrorMessage("");
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("account_type", res.data.account_type);
          navigate("/" + res.data.account_type);
        }
      });
  };

  return (
    <>
      <Row className="mb-4 justify-content-center">
        <Col>
          <h1>Login</h1>
        </Col>
      </Row>
      <Row>
        <Col className="mx-auto">
          <Form
            className="login-form"
            noValidate
            validated={validated}
            onSubmit={handleSubmit}
          >
            <Row as={Col}>
              <Form.Group className="mb-4">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="email"
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                  }}
                  required
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  Email required.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row as={Col}>
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="password"
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                  }}
                  required
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  Password required.
                </Form.Control.Feedback>
                <a href="/forgotpassword" className="mb-4">
                  Forgot Password?
                </a>
              </Form.Group>
            </Row>
            <Row>
              <p className="login-error-message">{errorMessage}</p>
            </Row>
            <Row>
              <Stack gap={2} className="mx-auto">
                <Button
                  className="login-button btn-lg mb-4 mx-auto"
                  type="submit"
                >
                  LOG IN
                </Button>
                <Button
                  className="register-button btn-lg mb-4 mx-auto"
                  variant="outline-primary"
                  href="/registration"
                  type="button"
                >
                  NEW HERE? REGISTER
                </Button>
              </Stack>
            </Row>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default LoginForm;
