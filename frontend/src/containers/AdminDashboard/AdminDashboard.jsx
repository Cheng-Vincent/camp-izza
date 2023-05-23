import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Accordion from "react-bootstrap/Accordion";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";
import "./AdminDashboard.css";
import LoadingPage from "../../components/LoadingPage/LoadingPage";

const AdminDashboard = () => {
  const [adminID, setAdminID] = useState(-1);
  const [adminInfo, setAdminInfo] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // checks if user is logged in
    Axios.get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/login").then(
      (response) => {
        console.log(response)
        if (response.data.loggedIn) {
          if (response.data.user.account_type === "admin")
            setAdminID(response.data.user.user_id);
          else {
            navigate(`/${response.data.user.account_type}`);
          }
        } else {
          // navigate("/login");
        }
      }
    );
  }, []);

  useEffect(() => {
    if (adminID != -1) {
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/getAdminInfo", {
        adminID: adminID,
      }).then((response) => {
        if (response.data) {
          setAdminInfo(response.data.adminInfo);
        }
      });
    }
  }, [adminID]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/login";
    alert("Logged out!");
  };

  /* ACCOUNT SETTINGS FORMS */
  const [emailForm, setEmailForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const setAccountField = (form, field, value) => {
    switch (form) {
      case "email":
        setEmailForm({
          ...emailForm,
          [field]: value,
        });
        break;
      case "password":
        setPasswordForm({
          ...passwordForm,
          [field]: value,
        });
        break;
    }
    if (!!formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };
  const findEmailErrors = () => {
    const { email, confirmEmail } = emailForm;
    const newErrors = {};
    if (!email || email === "") newErrors.email = "Please enter your new email";
    else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    } else if (confirmEmail && !(email === confirmEmail)) {
      newErrors.email = "Emails do not match";
      newErrors.confirmEmail = "Emails do not match";
    }
    if (!confirmEmail || confirmEmail === "")
      newErrors.confirmEmail = "Please confirm your new email";
    return newErrors;
  };
  const findPasswordErrors = () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;
    const newErrors = {};
    if (!currentPassword || currentPassword === "")
      newErrors.currentPassword = "Please enter your current password";
    if (!newPassword || newPassword === "")
      newErrors.newPassword = "Please enter your new password";
    else if (confirmNewPassword && !(newPassword === confirmNewPassword)) {
      newErrors.newPassword = "Passwords do not match";
      newErrors.confirmNewPassword = "Passwords do not match";
    } else if (
      !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(
        newPassword
      )
    ) {
      newErrors.newPassword =
        "Password must be 8-15 characters long and contain at least one lowercase letter, " +
        "one uppercase letter, one digit, and one special character";
      newErrors.confirmNewPassword = "Please confirm your password";
    }
    if (!confirmNewPassword || confirmNewPassword === "")
      newErrors.confirmNewPassword = "Please confirm your new password";
    return newErrors;
  };
  const handleEmailSubmit = (event) => {
    event.preventDefault();
    const newErrors = findEmailErrors();
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
    } else {
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/checkEmail", {
        email: emailForm.email,
      }).then((response) => {
        if (!response.data.message) {
          setFormErrors({ email: "An account with this email already exists" });
        } else {
          updateEmail();
        }
      });
    }
  };
  const updateEmail = () => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/updateEmail", {
      id: adminID,
      newEmail: emailForm.email,
    }).then((response) => {
      alert(response.data.message);
      window.location.reload(false);
    });
  };
  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    const newErrors = findPasswordErrors();
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
    } else {
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/checkPassword", {
        id: adminID,
        password: passwordForm.currentPassword,
      }).then((response) => {
        if (!response.data.message) {
          setFormErrors({ currentPassword: "Incorrect password" });
        } else {
          updatePassword();
        }
      });
    }
  };
  const updatePassword = () => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/setPassword", {
      id: adminID,
      password: passwordForm.newPassword,
    }).then((response) => {
      alert(response.data.message);
      window.location.reload(false);
    });
  };

  return adminID != -1 && adminInfo ? (
    <div class="body pb-5">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <Row className="mt-3">
        <HeaderLogo href="/admin" />
      </Row>

      <div className="admin-container mx-auto py-3 mb-5">
        <Row className="mx-auto mt-3">
          <Col className="text-right">
            <CustomButton text="Logout" onClick={handleLogout} />
            <CustomButton
              text="Settings"
              rem="5.5rem"
              onClick={() => {
                setShowSettings(true);
              }}
            />
          </Col>
        </Row>

        <Row className="text-center mx-auto mb-3">
          <Col>
            <h1 style={{ fontSize: "1.7rem", color: "#e2e4ee" }}>
              Admin Dashboard
            </h1>
          </Col>
        </Row>

        <Row className="text-center mx-auto mb-5">
          <Col>
            <Row className="mx-2 my-3">
              <Col>
                <Container
                  as={Button}
                  variant="light"
                  style={{
                    "border-radius": "15px",
                    border: "3px solid #5489b8",
                  }}
                  className="admin-buttons text-center"
                  href="/admin/youth"
                >
                  <h2 className="my-2" style={{ "font-size": "1.2rem" }}>
                    <em class="material-symbols-outlined mx-2">face</em>
                    Youth
                  </h2>
                </Container>
              </Col>
              <Col>
                <Container
                  as={Button}
                  variant="light"
                  style={{
                    "border-radius": "15px",
                    border: "3px solid #5489b8",
                  }}
                  href="/admin/parents"
                  className="admin-buttons text-center"
                >
                  <h2 className="my-2" style={{ "font-size": "1.2rem" }}>
                    <em class="material-symbols-outlined mx-2">
                      supervisor_account
                    </em>
                    Parents
                  </h2>
                </Container>
              </Col>
            </Row>
            <Row className="mx-2 my-3">
              <Col>
                <Container
                  as={Button}
                  variant="light"
                  style={{
                    "border-radius": "15px",
                    border: "3px solid #5489b8",
                  }}
                  className="admin-buttons text-center"
                  href="/admin/roster"
                >
                  <h2 className="my-2" style={{ "font-size": "1.2rem" }}>
                    <em class="material-symbols-outlined mx-2">diversity_1</em>
                    Roster
                  </h2>
                </Container>
              </Col>
              <Col>
                <Container
                  as={Button}
                  variant="light"
                  style={{
                    "border-radius": "15px",
                    border: "3px solid #5489b8",
                  }}
                  className="admin-buttons text-center"
                  href="/admin/managegroup"
                >
                  <h2 className="my-2" style={{ "font-size": "1.2rem" }}>
                    <em class="material-symbols-outlined mx-2">groups</em>Groups
                  </h2>
                </Container>
              </Col>
            </Row>
            <Row className="mx-2 my-3">
              <Col>
                <Container
                  as={Button}
                  variant="light"
                  style={{
                    "border-radius": "15px",
                    border: "3px solid #5489b8",
                  }}
                  className="admin-buttons text-center"
                  href="/admin/counselors"
                >
                  <h2 className="my-2" style={{ "font-size": "1.2rem" }}>
                    <em class="material-symbols-outlined mx-2">sports</em>
                    Counselors
                  </h2>
                </Container>
              </Col>
              <Col>
                <Container
                  as={Button}
                  variant="light"
                  style={{
                    "border-radius": "15px",
                    border: "3px solid #5489b8",
                  }}
                  className="admin-buttons text-center"
                  href="admin/financialaid"
                >
                  <h2 className="my-2" style={{ "font-size": "1.2rem" }}>
                    <em class="material-symbols-outlined mx-2">
                      request_quote
                    </em>
                    Financial Aid
                  </h2>
                </Container>
              </Col>
            </Row>
            <Row className="mx-2 my-3">
              <Col>
                <Container
                  as={Button}
                  variant="light"
                  style={{
                    "border-radius": "15px",
                    border: "3px solid #5489b8",
                  }}
                  className="admin-buttons text-center"
                  href="admin/program"
                >
                  <h2 className="my-2" style={{ "font-size": "1.2rem" }}>
                    <em class="material-symbols-outlined mx-2">campaign</em>
                    Program Info
                  </h2>
                </Container>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <Modal
        show={showSettings}
        onHide={() => {
          setShowSettings(false);
        }}
        backdrop="static"
        keyboard={false}
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Account Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Accordion as={Card}>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <span class="material-symbols-outlined">email</span>
                {adminInfo.email}
              </Accordion.Header>
              <Accordion.Body>
                <Form onSubmit={handleEmailSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Label>New Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="New email"
                      isInvalid={!!formErrors.email}
                      onChange={(e) => {
                        setAccountField(
                          "email",
                          "email",
                          e.target.value.trim()
                        );
                      }}
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Confirm New Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Confirm new email"
                      isInvalid={!!formErrors.confirmEmail}
                      onChange={(e) => {
                        setAccountField(
                          "email",
                          "confirmEmail",
                          e.target.value.trim()
                        );
                      }}
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.confirmEmail}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Button type="submit">Save</Button>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <span class="material-symbols-outlined">key</span>
                ************
              </Accordion.Header>
              <Accordion.Body>
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Current password"
                      isInvalid={!!formErrors.currentPassword}
                      onChange={(e) => {
                        setAccountField(
                          "password",
                          "currentPassword",
                          e.target.value.trim()
                        );
                      }}
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.currentPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="New password"
                      isInvalid={!!formErrors.newPassword}
                      onChange={(e) => {
                        setAccountField(
                          "password",
                          "newPassword",
                          e.target.value.trim()
                        );
                      }}
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.newPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      isInvalid={!!formErrors.confirmNewPassword}
                      onChange={(e) => {
                        setAccountField(
                          "password",
                          "confirmNewPassword",
                          e.target.value.trim()
                        );
                      }}
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.confirmNewPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Button type="submit">Save</Button>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
      </Modal>
    </div>
  ) : (
    <LoadingPage />
  );
};

export default AdminDashboard;
