import React, { useState } from "react";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

const CreateAdminAccount = () => {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const setField = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
    if (!!errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const findFormErrors = () => {
    const { firstName, lastName, email, password, confirmPassword } = form;
    const newErrors = {};
    if (!firstName || firstName === "")
      newErrors.firstName = "First name required";
    if (!lastName || lastName === "") newErrors.lastName = "Last name required";
    if (!email || email === "") newErrors.email = "Email required";
    else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password || password === "")
      newErrors.password = "Please choose a password";
    else if (confirmPassword && !(confirmPassword === password)) {
      newErrors.confirmPassword = "Passwords do not match";
      newErrors.password = "Passwords do not match";
    } else if (
      !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(
        password
      )
    ) {
      newErrors.password =
        "Password must be 8-15 characters long and contain at least one lowercase letter, " +
        "one uppercase letter, one digit, and one special character";
      newErrors.confirmPassword = "Please confirm your password";
    }
    if (!confirmPassword || confirmPassword === "")
      newErrors.confirmPassword = "Please confirm your password";
    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = findFormErrors();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/checkEmail", {
        email: form.email,
      }).then((response) => {
        if (!response.data.message) {
          setErrors({ email: "An account with this email already exists" });
        } else {
          register();
        }
      });
    }
  };

  const register = () => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/register", {
      email: form.email,
      password: form.password,
      first_name: form.firstName,
      last_name: form.lastName,
      account_type: "admin",
      registered_at: new Date(),
    }).then((response) => {
      alert(response.data.message);
      navigate("/login");
    });
  };

  return (
    <>
      <div class="login-container my-4">
        <Form class="registration-form" onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Form.Group className="mb-4">
                <Form.Label>Admin First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="first name"
                  isInvalid={!!errors.firstName}
                  onChange={(e) => {
                    setField("firstName", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-4">
                <Form.Label>Admin Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="last name"
                  isInvalid={!!errors.lastName}
                  onChange={(e) => {
                    setField("lastName", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-4">
                <Form.Label>Admin Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="email"
                  isInvalid={!!errors.email}
                  onChange={(e) => {
                    setField("email", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-4">
                <Form.Label>Admin Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="password"
                  isInvalid={!!errors.password}
                  onChange={(e) => {
                    setField("password", e.target.value);
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="confirm password"
                  isInvalid={!!errors.confirmPassword}
                  onChange={(e) => {
                    setField("confirmPassword", e.target.value);
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button onClick={handleSubmit}>REGISTER</Button>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default CreateAdminAccount;
