import React, { useState } from "react";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";
import "./YouthDashboard.css";
import PlaceholderCard from "../../components/PlaceholderCard/PlaceholderCard";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import LoadingPage from "../../components/LoadingPage/LoadingPage";
import CustomButton from "../../components/CustomButton";

const YouthDashboardContents = ({
  isLoading,
  youthInfo,
  youthGroups,
  roster,
}) => {
  const [showBus, setShowBus] = useState(false);
  const [showFamily, setShowFamily] = useState(false);
  const [showCabin, setShowCabin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  const formatDate = (dateToFormat) => {
    const date = new Date(dateToFormat);
    let m = (date.getMonth() + 1).toString().padStart(2, 0);
    let d = date.getDate().toString().padStart(2, 0);
    return `${m}/${d}/${date.getFullYear()}`;
  };

  /* START Account settings form controls */
  const [emailForm, setEmailForm] = useState({});
  const [phoneForm, setPhoneForm] = useState({});
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
      case "phone":
        setPhoneForm({
          ...phoneForm,
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
  const findPhoneErrors = () => {
    const { phoneNumber, confirmPhoneNumber } = phoneForm;
    const newErrors = {};
    if (!phoneNumber || phoneNumber === "")
      newErrors.phoneNumber = "Please enter your new phone number";
    else if (!/^\d+$/.test(phoneNumber))
      newErrors.phoneNumber = "Please enter only digits";
    else if (phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Please enter a 10-digit phone number";
    } else if (confirmPhoneNumber && !(phoneNumber === confirmPhoneNumber)) {
      newErrors.phoneNumber = "Phone numbers do not match";
      newErrors.confirmPhoneNumber = "Phone numbers do not match";
    }
    if (!confirmPhoneNumber || confirmPhoneNumber === "")
      newErrors.confirmPhoneNumber = "Please confirm your new phone number";
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
      id: youthInfo.youth_id,
      newEmail: emailForm.email,
    }).then((response) => {
      alert(response.data.message);
      window.location.reload(false);
    });
  };
  const handlePhoneSubmit = (event) => {
    event.preventDefault();
    const newErrors = findPhoneErrors();
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
    } else {
      Axios.post(
        process.env.REACT_APP_YSS_BACKEND_SERVER + "/updateYouthPhone",
        {
          id: youthInfo.youth_id,
          newPhone: phoneForm.phoneNumber,
        }
      ).then((response) => {
        alert(response.data.message);
        window.location.reload(false);
      });
    }
  };
  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    const newErrors = findPasswordErrors();
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
    } else {
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/checkPassword", {
        id: youthInfo.youth_id,
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
      id: youthInfo.youth_id,
      password: passwordForm.newPassword,
    }).then((response) => {
      alert(response.data.message);
      window.location.reload(false);
    });
  };

  /* END Account settings form controls */

  /* START Pre-survey form controls */
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({});
  const [characterLimit] = useState(120);
  const [questInp, setInputText1] = useState("");
  const [activInp, setInputText2] = useState("");
  const [hopeInp, setInputText3] = useState("");

  const changeQuest = (event) => {
    setInputText1(event.target.value);
    setField("question", event.target.value.trim());
  };
  const changeAct = (e) => {
    setInputText2(e.target.value);
    setField("activity", e.target.value.trim());
  };
  const changeHope = (e) => {
    setInputText3(e.target.value);
    setField("hopes", e.target.value.trim());
  };

  const setField = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
    if (!!errors[field])
      setErrors({
        ...errors,
        [field]: null,
      });
  };

  const handleSpirituality = (e) => {
    e.persist();
    if (e.target.value === "Very Low") {
      setField("spirituality", 1);
    } else if (e.target.value === "Low") {
      setField("spirituality", 2);
    } else if (e.target.value === "Neutral") {
      setField("spirituality", 3);
    } else if (e.target.value === "High") {
      setField("spirituality", 4);
    } else {
      setField("spirituality", 5);
    }
  };

  const handleKnowledge = (e) => {
    e.persist();
    if (e.target.value === "Very Low") {
      setField("knowledge", 1);
    } else if (e.target.value === "Low") {
      setField("knowledge", 2);
    } else if (e.target.value === "Neutral") {
      setField("knowledge", 3);
    } else if (e.target.value === "High") {
      setField("knowledge", 4);
    } else {
      setField("knowledge", 5);
    }
  };

  const handleImprovement = (e) => {
    e.persist();
    if (e.target.value === "Very Low") {
      setField("improvement", 1);
    } else if (e.target.value === "Low") {
      setField("improvement", 2);
    } else if (e.target.value === "Neutral") {
      setField("improvement", 3);
    } else if (e.target.value === "High") {
      setField("improvement", 4);
    } else {
      setField("improvement", 5);
    }
  };

  const handleCommunity = (e) => {
    e.persist();
    if (e.target.value === "Very Low") {
      setField("community", 1);
    } else if (e.target.value === "Low") {
      setField("community", 2);
    } else if (e.target.value === "Neutral") {
      setField("community", 3);
    } else if (e.target.value === "High") {
      setField("community", 4);
    } else {
      setField("community", 5);
    }
  };

  const check = () => {
    const {
      shirtSize,
      spirituality,
      knowledge,
      improvement,
      community,
      hopes,
      question,
      activity,
      file,
    } = form;
    const errorsMessage = {};
    if (!shirtSize) {
      errorsMessage.shirtSize = "Shirt size is required.";
    }
    if (!spirituality) {
      errorsMessage.spirituality = "Spiritualty is required";
    }
    if (!knowledge) {
      errorsMessage.knowledge = "Knowledge is required";
    }
    if (!improvement) {
      errorsMessage.improvement = "Improvement is required";
    }
    if (!community) {
      errorsMessage.community = "Community is required";
    }
    if (!hopes || hopes === "") {
      errorsMessage.hopes = "This is required";
    } else if (hopes.length > characterLimit) {
      errorsMessage.hopes = "You've reached the maximum character limit.";
    }
    if (!question || question === "") {
      errorsMessage.question = "This is required.";
    } else if (question.length > characterLimit) {
      errorsMessage.question = "You've reached the maximum character limit.";
    }
    if (!activity || activity === "") {
      errorsMessage.activity = "This is required.";
    } else if (activity.length > characterLimit) {
      errorsMessage.activity = "You've reached the maximum character limit.";
    }
    if (!file || !/\.(jpg|JPG|jpeg|png|PNG)$/.test(file)) {
      errorsMessage.file = "Only image files (jpeg, jpg, png) are allowed!.";
    }
    return errorsMessage;
  };

  const saveInfo = (e) => {
    e.preventDefault();
    const newErrors = check();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      enterSurvey();
    }
  };

  const enterSurvey = () => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/enterSurvey", {
      youthID: youthInfo.youth_id,
      shirtSize: form.shirtSize,
      spirituality: form.spirituality,
      knowledge: form.knowledge,
      improvement: form.improvement,
      community: form.community,
      hopes: form.hopes,
      question: form.question,
      activity: form.activity,
      submitted_at: new Date(),
    }).then((response) => {
      alert("Thank you for completing the presurvey.");
      setShowSurvey(false);
      window.location.reload(false);
    });
  };

  /* END Pre-survey form controls */

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/login";
    alert("Logged out!");
  };

  return isLoading ? (
    <LoadingPage />
  ) : (
    <div class="body">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <Row className="mt-3">
        <HeaderLogo href="/youth" />
      </Row>

      <div className="admin-container mx-auto py-3">
        <Row className="mx-auto mt-3">
          <Col className="text-right">
            <CustomButton text="Logout" onClick={handleLogout} />
          </Col>
        </Row>
        <Row className="text-center mx-auto mb-3">
          <Col>
            <h1 style={{ fontSize: "1.7rem", color: "#e2e4ee" }}>
              Youth Dashboard
            </h1>
          </Col>
        </Row>

        <Row className="mx-auto mb-5">
          <Col>
            <h2
              style={{
                "text-align": "center",
                fontSize: "1.3rem",
                color: "#e2e4ee",
              }}
            >
              Tasks
            </h2>
            {!youthInfo.survey_completed ? (
              <Card
                className="dashboard-card mb-3"
                id="survey-widget"
                as={Container}
                border="light"
                style={{ width: "18rem" }}
              >
                <Card.Body>
                  <Card.Title>Pre-Retreat Survey</Card.Title>
                  <Card.Text>Please complete this presurvey form.</Card.Text>
                  <Button
                    onClick={() => {
                      setShowSurvey(true);
                    }}
                  >
                    Go
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <></>
            )}
            {Object.keys(youthGroups).length === 0 ? (
              <Card
                className="dashboard-card mb-3 mt-3"
                id="choose-widget"
                as={Container}
                border="light"
                style={{ width: "18rem" }}
              >
                <Card.Body>
                  <Card.Title>Choose Your Groups</Card.Title>
                  <Card.Text>Choose your family, bus, and cabin.</Card.Text>
                  <Button href="/youth/groupselection">Go</Button>
                </Card.Body>
              </Card>
            ) : (
              <></>
            )}
            <Card
              className="dashboard-card mb-3"
              id="schedule-widget"
              as={Container}
              border="light"
              style={{ width: "18rem" }}
            >
              <Card.Body>
                <Card.Title>Program Schedule</Card.Title>
                <Card.Text>Coming Soon.</Card.Text>
                <Button disabled>Go</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            {Object.keys(youthInfo).length > 0 ? (
              <Card
                className="dashboard-card mb-3"
                id="about-widget"
                as={Container}
                border="light"
                style={{ width: "20rem" }}
              >
                <ListGroup as={Card.Body} className="list-group-flush">
                  <Card.Title className="text-center">About You</Card.Title>
                  <ListGroup.Item>
                    <span class="material-symbols-outlined">face</span>{" "}
                    {youthInfo.first_name} {youthInfo.last_name}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <span class="material-symbols-outlined">cake</span>{" "}
                    {formatDate(youthInfo.birthday)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <span class="material-symbols-outlined">school</span>{" "}
                    {youthInfo.grade}th grade
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            ) : (
              <PlaceholderCard></PlaceholderCard>
            )}
            {Object.keys(youthGroups).length > 0 ? (
              <Card
                className="dashboard-card mb-3"
                id="groups-widget"
                as={Container}
                border="light"
                style={{ width: "20rem" }}
              >
                <Card.Body>
                  <Card.Title className="mb-3 text-center">
                    Your Groups
                  </Card.Title>
                  <CardGroup>
                    <Card
                      className="group-card mb-3"
                      as={Button}
                      variant="outline-dark"
                      onClick={() => {
                        setShowBus(true);
                      }}
                    >
                      <Card.Title></Card.Title>
                      <Card.Subtitle>
                        <em class="material-symbols-outlined">
                          directions_bus
                        </em>
                      </Card.Subtitle>
                      <Card.Text>Bus {youthGroups.bus}</Card.Text>
                    </Card>
                    <Card
                      className="group-card mb-3"
                      as={Button}
                      variant="outline-dark"
                      onClick={() => {
                        setShowFamily(true);
                      }}
                    >
                      <Card.Title></Card.Title>
                      <Card.Subtitle>
                        <em class="material-symbols-outlined">diversity_1</em>
                      </Card.Subtitle>
                      <Card.Text>Family {youthGroups.family}</Card.Text>
                    </Card>
                    <Card
                      className="group-card mb-3"
                      as={Button}
                      variant="outline-dark"
                      onClick={() => {
                        setShowCabin(true);
                      }}
                    >
                      <Card.Title></Card.Title>
                      <Card.Subtitle>
                        <em class="material-symbols-outlined">cottage</em>
                      </Card.Subtitle>
                      <Card.Text>Cabin {youthGroups.cabin}</Card.Text>
                    </Card>
                  </CardGroup>
                  <Button href="/youth/groupselection">Edit</Button>
                </Card.Body>
              </Card>
            ) : (
              <></>
            )}
          </Col>
          <Col>
            {Object.keys(youthInfo).length > 0 ? (
              <Card
                className="dashboard-card mb-3"
                id="account-widget"
                as={Container}
                border="light"
                style={{ width: "20rem" }}
              >
                <ListGroup as={Card.Body} className="list-group-flush">
                  <Card.Title className="text-center">
                    Account Information
                  </Card.Title>
                  <ListGroup.Item>
                    <span class="material-symbols-outlined">email</span>{" "}
                    {youthInfo.email}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <span class="material-symbols-outlined">phone</span>{" "}
                    {youthInfo.phone_number}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <span class="material-symbols-outlined">key</span>{" "}
                    ************
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Button
                      className="mx-auto"
                      onClick={() => {
                        setShowAccount(true);
                      }}
                    >
                      Edit
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            ) : (
              <PlaceholderCard></PlaceholderCard>
            )}
          </Col>
        </Row>

        <Modal
          className="account-modal"
          show={showAccount}
          onHide={() => {
            setShowAccount(false);
          }}
          backdrop="static"
          keyboard={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Account Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Accordion as={Card}>
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <span class="material-symbols-outlined">email</span>{" "}
                  {youthInfo.email}
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
                  <span class="material-symbols-outlined">phone</span>{" "}
                  {youthInfo.phone_number}
                </Accordion.Header>
                <Accordion.Body>
                  <Form onSubmit={handlePhoneSubmit}>
                    <Form.Group className="mb-2">
                      <Form.Label>New Phone Number</Form.Label>
                      <Form.Control
                        type="phone"
                        placeholder="New phone number"
                        isInvalid={!!formErrors.phoneNumber}
                        onChange={(e) => {
                          setAccountField(
                            "phone",
                            "phoneNumber",
                            e.target.value.trim()
                          );
                        }}
                      ></Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.phoneNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Confirm New Phone Number</Form.Label>
                      <Form.Control
                        type="phone"
                        placeholder="Confirm new phone number"
                        isInvalid={!!formErrors.confirmPhoneNumber}
                        onChange={(e) => {
                          setAccountField(
                            "phone",
                            "confirmPhoneNumber",
                            e.target.value.trim()
                          );
                        }}
                      ></Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.confirmPhoneNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Button type="submit">Save</Button>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
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
            <Modal.Footer>
              <Button
                onClick={() => {
                  setShowAccount(false);
                }}
              >
                Cancel
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Modal>

        <Modal
          className="bus-modal"
          show={showBus}
          onHide={() => {
            setShowBus(false);
          }}
          backdrop="static"
          keyboard={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Bus {youthGroups.bus}</Modal.Title>
            <Badge
              pill
              className="ml-3 mr-1 px-2"
              bg="dark"
              style={{ "font-size": "12px" }}
            >
              <span class="material-symbols-outlined">directions_bus</span>{" "}
              Capacity: {youthGroups.b_capacity}
            </Badge>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-2">
              <Col>
                <b>Members</b>
              </Col>
            </Row>
            <Row>
              <Col>
                {roster.bus_roster ? (
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.bus_roster.map((row, i) => (
                        <tr>
                          <td>{i + 1}</td>
                          <td>{row.youth_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <></>
                )}
              </Col>
            </Row>
            <Modal.Footer>
              <Button
                onClick={() => {
                  setShowBus(false);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Modal>

        <Modal
          className="family-modal"
          show={showFamily}
          onHide={() => {
            setShowFamily(false);
          }}
          backdrop="static"
          keyboard={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Family {youthGroups.family}</Modal.Title>
            <Badge
              pill
              className="ml-3 mr-1 px-2"
              bg="dark"
              style={{ "font-size": "12px" }}
            >
              <span class="material-symbols-outlined">diversity_1</span>{" "}
              Capacity: {youthGroups.f_capacity}
            </Badge>
            <Badge
              pill
              className="px-2"
              bg="dark"
              style={{ "font-size": "12px" }}
            >
              <span class="material-symbols-outlined">school</span> Grade:{" "}
              {youthGroups.f_grade}
            </Badge>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-2">
              <Col>
                <b>Members</b>
              </Col>
            </Row>
            <Row>
              <Col>
                {roster.family_roster ? (
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.family_roster.map((row, i) => (
                        <tr>
                          <td>{i + 1}</td>
                          <td>{row.youth_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <></>
                )}
              </Col>
            </Row>
            <Modal.Footer>
              <Button
                onClick={() => {
                  setShowFamily(false);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Modal>

        <Modal
          className="cabin-modal"
          show={showCabin}
          onHide={() => {
            setShowCabin(false);
          }}
          backdrop="static"
          keyboard={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Cabin {youthGroups.cabin}</Modal.Title>
            <Badge
              pill
              className="ml-3 mr-1 px-2"
              bg="dark"
              style={{ "font-size": "12px" }}
            >
              <span class="material-symbols-outlined">cottage</span> Capacity:{" "}
              {youthGroups.c_capacity}
            </Badge>
            <Badge
              pill
              className="px-2"
              bg="dark"
              style={{ "font-size": "12px" }}
            >
              <span class="material-symbols-outlined">
                {youthGroups.c_gender === "m" ? "male" : "female"}
              </span>{" "}
              Gender: {youthGroups.c_gender === "m" ? "Male" : "Female"}
            </Badge>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-2">
              <Col>
                <b>Members</b>
              </Col>
            </Row>
            <Row>
              <Col>
                {roster.cabin_roster ? (
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.cabin_roster.map((row, i) => (
                        <tr>
                          <td>{i + 1}</td>
                          <td>{row.youth_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <></>
                )}
              </Col>
            </Row>
            <Modal.Footer>
              <Button
                onClick={() => {
                  setShowCabin(false);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Modal>
        <Modal
          show={showSurvey}
          onHide={() => {
            setShowSurvey(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Pre-Retreat Survey</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mx-auto">
              <Form as={Col} noValidate>
                <Row className="mb-4">
                  <Form.Group as={Col}>
                    <Form.Label>Select Shirt Size*</Form.Label>
                    <Form.Control
                      as="select"
                      aria-label="Select Shirt Size"
                      onChange={(e) => {
                        setField("shirtSize", e.target.value);
                      }}
                      isInvalid={!!errors.shirtSize}
                    >
                      <option value="">Shirt Size</option>
                      <option value="S">Small</option>
                      <option value="M">Medium</option>
                      <option value="L">Large</option>
                      <option value="XL">Extra Large</option>
                      <option value="XXL">Extra Extra Large</option>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.shirtSize}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row>
                  <label>How would you rate yourself on the following?</label>
                </Row>
                <Row className="mb-4">
                  <Form.Group as={Col}>
                    <Row>
                      <label>Spirituality (Closeness to God)*</label>
                    </Row>
                    <Form.Check
                      name="spirituality"
                      inline
                      value="Very Low"
                      type="radio"
                      aria-label="radio 1"
                      label="Very Low"
                      onChange={handleSpirituality}
                      isInvalid={!!errors.spirituality}
                    />
                    <Form.Check
                      name="spirituality"
                      inline
                      value="Low"
                      type="radio"
                      aria-label="radio 1"
                      label="Low"
                      onChange={handleSpirituality}
                      isInvalid={!!errors.spirituality}
                    />
                    <Form.Check
                      name="spirituality"
                      inline
                      value="Neutral"
                      type="radio"
                      aria-label="radio 1"
                      label="Neutral"
                      onChange={handleSpirituality}
                      isInvalid={!!errors.spirituality}
                    />
                    <Form.Check
                      name="spirituality"
                      inline
                      value="High"
                      type="radio"
                      aria-label="radio 1"
                      label="High"
                      onChange={handleSpirituality}
                      isInvalid={!!errors.spirituality}
                    />
                    <Form.Check
                      name="spirituality"
                      inline
                      value="Very High"
                      type="radio"
                      aria-label="radio 1"
                      label="Very High"
                      onChange={handleSpirituality}
                      isInvalid={!!errors.spirituality}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.spirituality}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-4">
                  <Form.Group as={Col}>
                    <Row>
                      <label>Religious Knowledge*</label>
                    </Row>
                    <Form.Check
                      name="knowledge"
                      inline
                      value="Very Low"
                      type="radio"
                      aria-label="radio 1"
                      label="Very Low"
                      onChange={handleKnowledge}
                      isInvalid={!!errors.knowledge}
                    />
                    <Form.Check
                      name="knowledge"
                      inline
                      value="Low"
                      type="radio"
                      aria-label="radio 1"
                      label="Low"
                      onChange={handleKnowledge}
                      isInvalid={!!errors.knowledge}
                    />
                    <Form.Check
                      name="knowledge"
                      inline
                      value="Neutral"
                      type="radio"
                      aria-label="radio 1"
                      label="Neutral"
                      onChange={handleKnowledge}
                      isInvalid={!!errors.knowledge}
                    />
                    <Form.Check
                      name="knowledge"
                      inline
                      value="High"
                      type="radio"
                      aria-label="radio 1"
                      label="High"
                      onChange={handleKnowledge}
                      isInvalid={!!errors.knowledge}
                    />
                    <Form.Check
                      name="knowledge"
                      inline
                      value="Very High"
                      type="radio"
                      aria-label="radio 1"
                      label="Very High"
                      onChange={handleKnowledge}
                      isInvalid={!!errors.knowledge}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.knowledge}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-4">
                  <Form.Group as={Col}>
                    <Row>
                      <label>
                        Actively improving myself mentally, physically,
                        spiritually*
                      </label>
                    </Row>
                    <Form.Check
                      name="improvement"
                      inline
                      value="Very Low"
                      type="radio"
                      aria-label="radio 1"
                      label="Very Low"
                      onChange={handleImprovement}
                      isInvalid={!!errors.improvement}
                    />
                    <Form.Check
                      name="improvement"
                      inline
                      value="Low"
                      type="radio"
                      aria-label="radio 1"
                      label="Low"
                      onChange={handleImprovement}
                      isInvalid={!!errors.improvement}
                    />
                    <Form.Check
                      name="improvement"
                      inline
                      value="Neutral"
                      type="radio"
                      aria-label="radio 1"
                      label="Neutral"
                      onChange={handleImprovement}
                      isInvalid={!!errors.improvement}
                    />
                    <Form.Check
                      name="improvement"
                      inline
                      value="High"
                      type="radio"
                      aria-label="radio 1"
                      label="High"
                      onChange={handleImprovement}
                      isInvalid={!!errors.improvement}
                    />
                    <Form.Check
                      name="improvement"
                      inline
                      value="Very High"
                      type="radio"
                      aria-label="radio 1"
                      label="Very High"
                      onChange={handleImprovement}
                      isInvalid={!!errors.improvement}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.improvement}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-4">
                  <Form.Group as={Col}>
                    <Row>
                      <label>
                        Actively involved in making my community better*
                      </label>
                    </Row>
                    <Form.Check
                      name="community"
                      inline
                      value="Very Low"
                      type="radio"
                      aria-label="radio 1"
                      label="Very Low"
                      onChange={handleCommunity}
                      isInvalid={!!errors.community}
                    />
                    <Form.Check
                      name="community"
                      inline
                      value="Low"
                      type="radio"
                      aria-label="radio 1"
                      label="Low"
                      onChange={handleCommunity}
                      isInvalid={!!errors.community}
                    />
                    <Form.Check
                      name="community"
                      inline
                      value="Neutral"
                      type="radio"
                      aria-label="radio 1"
                      label="Neutral"
                      onChange={handleCommunity}
                      isInvalid={!!errors.community}
                    />
                    <Form.Check
                      name="community"
                      inline
                      value="High"
                      type="radio"
                      aria-label="radio 1"
                      label="High"
                      onChange={handleCommunity}
                      isInvalid={!!errors.community}
                    />
                    <Form.Check
                      name="community"
                      inline
                      value="Very High"
                      type="radio"
                      aria-label="radio 1"
                      label="Very High"
                      onChange={handleCommunity}
                      isInvalid={!!errors.community}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.community}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-4">
                  <Form.Group as={Col}>
                    <Form.Label>
                      What's one burning question you hope to get answered at
                      this year's summit?*
                    </Form.Label>
                    <Form.Control
                      rows={3}
                      type="text"
                      value={questInp}
                      isInvalid={!!errors.question}
                      onChange={changeQuest}
                    ></Form.Control>
                    <Badge
                      className="mt-3"
                      bg={`${
                        questInp.length > characterLimit ? "danger" : "primary"
                      }`}
                    >
                      {questInp.length}/{characterLimit}
                    </Badge>
                    <Form.Control.Feedback type="invalid">
                      {errors.question}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-4">
                  <Form.Group as={Col}>
                    <Form.Label>
                      What's one activity you're looking forward to at this
                      year's summit?*
                    </Form.Label>
                    <Form.Control
                      rows={3}
                      type="text"
                      value={activInp}
                      isInvalid={!!errors.activity}
                      onChange={changeAct}
                    ></Form.Control>
                    <Badge
                      className="mt-3"
                      bg={`${
                        activInp.length > characterLimit ? "danger" : "primary"
                      }`}
                    >
                      {activInp.length}/{characterLimit}
                    </Badge>
                    <Form.Control.Feedback type="invalid">
                      {errors.activity}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-4">
                  <Form.Group as={Col}>
                    <Form.Label>
                      What do you hope to get out of the retreat?*
                    </Form.Label>
                    <Form.Control
                      rows={3}
                      type="text"
                      value={hopeInp}
                      isInvalid={!!errors.hopes}
                      onChange={changeHope}
                    ></Form.Control>
                    <Badge
                      className="mt-3"
                      bg={`${
                        hopeInp.length > characterLimit ? "danger" : "primary"
                      }`}
                    >
                      {hopeInp.length}/{characterLimit}
                    </Badge>
                    <Form.Control.Feedback type="invalid">
                      {errors.hopes}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-4">
                  <Form.Group as={Col} controlId="formFile" className="mb-3">
                    <Form.Label>Please upload your student ID*</Form.Label>
                    <Form.Control
                      type="file"
                      isInvalid={!!errors.file}
                      onChange={(e) => {
                        setField("file", e.target.value);
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.file}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
              </Form>
            </Row>
            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                onClick={saveInfo}
                class="btn btn-danger btn-lg btn-block mb-3"
              >
                Submit
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowSurvey(false);
                }}
                class="btn btn-primary btn-lg btn-block mb-3"
              >
                Cancel
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default YouthDashboardContents;
