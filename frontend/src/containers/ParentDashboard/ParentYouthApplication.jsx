import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import yss_logo_blue from "../../assets/yss-logo.png";

const ParentYouthApplication = () => {
  const [errors, setErrors] = useState({});
  const [parentID, setParentID] = useState(0);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

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

  useEffect(() => {
    // checks if user is logged in
    axios
      .get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/login")
      .then((response) => {
        if (response) {
          if (response.data.loggedIn) {
            setParentID(response.data.user.user_id);
          } else {
            navigate("/login");
          }
        }
      });
  }, []);

  const check = () => {
    const { firstName, lastName, birthday, phone, grade, gender, email } = form;
    const errorsMessage = {};
    if (!birthday) {
      errorsMessage.birthday = "Birthday is required.";
    }
    if (!!birthday) {
      var checkBirthday = birthday.split("/");
      if (checkBirthday.length == 3) {
        const date = new Date(birthday);
        if (!date.getTime()) {
          errorsMessage.birthday = "Enter Valid Birthday";
        }
      } else {
        errorsMessage.birthday = "Enter Valid Birthday";
      }
    }
    if (!phone) {
      errorsMessage.phone = "Phone Number is required.";
    }
    if (!!phone) {
      if (!/^\d+$/.test(phone)) {
        errorsMessage.phone = "Enter only numbers.";
      } else if (phone.length !== 10) {
        errorsMessage.phone = "Please enter 10 digit phone number.";
      }
    }
    if (!email) {
      errorsMessage.email = "Email is required.";
    } else {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        errorsMessage.email = "Enter Valid Email";
      }
    }

    if (!grade) {
      errorsMessage.grade = "Grade is required.";
    }
    if (!gender) {
      errorsMessage.gender = "Gender is required.";
    }
    if (!firstName) {
      errorsMessage.firstName = "First name is required.";
    } else {
      if (/^\s*$/.test(firstName)) {
        errorsMessage.firstName = "First Name is required.";
      }
    }
    if (!lastName) {
      errorsMessage.lastName = "Last name is required.";
    } else {
      if (/^\s*$/.test(lastName)) {
        errorsMessage.lastName = "Last Name is required.";
      }
    }
    return errorsMessage;
  };

  const saveInfo = (e) => {
    e.preventDefault();
    const newErrors = check();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/checkEmail", {
        email: form.email,
      }).then((response) => {
        if (!response.data.message) {
          setErrors({ email: "Email already being used." });
        } else {
          enterYouth();
        }
      });
    }
  };

  const enterYouth = () => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/register", {
      email: form.email,
      password: form.birthday,
      first_name: form.firstName,
      last_name: form.lastName,
      account_type: "youth",
      registered_at: new Date(),
    }).then(() => {
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/youth", {
        firstName: form.firstName,
        lastName: form.lastName,
        birthday: form.birthday,
        grade: form.grade,
        gender: form.gender,
        email: form.email,
        phone: form.phone,
        parentID: parentID,
      }).then((response) => {
        alert("Youth added!");
        const youthID = response.data.id;
        Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/youthEmail", {
          parentID: parentID,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          youthID: youthID,
        })
          .then((response) => {
            if (response.data.email_sent) navigate("/parent");
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });
  };

  const handleGrade = (e) => {
    e.persist();
    setField("grade", e.target.value);
    // if (!!errors.grade) setErrors({
    //     ...errors,
    //     grade: null
    // })
  };

  return (
    <>
      <div className="mt-5" style={{ textAlign: "center" }}>
        <a href="/parent">
          <img
            className="col"
            class="logo"
            alt="YSS Logo"
            src={yss_logo_blue}
            style={{
              width: "150px",
              height: "75px",
              objectFit: "scale-down",
            }}
          ></img>
        </a>
      </div>
      <div className="container registration-container">
        <Row className="mb-4 mx-auto">
          <Col>
            <h1>Youth Application Form</h1>
          </Col>
        </Row>
        <Row className="mx-auto">
          <Form as={Col} noValidate>
            <Row className="mb-4">
              <Form.Group as={Col}>
                <Form.Label>Youth First Name</Form.Label>
                <Form.Control
                  type="name"
                  placeholder="Enter Youth First Name"
                  onChange={(e) => {
                    setField("firstName", e.target.value.trim());
                  }}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Youth Last Name</Form.Label>
                <Form.Control
                  type="name"
                  placeholder="Enter Youth Last Name"
                  onChange={(e) => {
                    setField("lastName", e.target.value.trim());
                  }}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-4">
              <Form.Group as={Col}>
                <Form.Label>Youth Date of Birth (MM/DD/YY)</Form.Label>
                <Form.Control
                  required
                  type="birthday"
                  placeholder="Enter Birthday"
                  onChange={(e) => {
                    setField("birthday", e.target.value);
                  }}
                  isInvalid={!!errors.birthday}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.birthday}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Youth Phone Number</Form.Label>
                <Form.Control
                  type="phonenumber"
                  placeholder="Enter Phone Number"
                  onChange={(e) => {
                    setField("phone", e.target.value);
                  }}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-4">
              <Form.Group as={Col}>
                <Row>
                  <label>Grade in Fall 2023 (or Equivalent)</label>
                </Row>
                <Form.Check
                  name="grade"
                  inline
                  value="9"
                  type="radio"
                  aria-label="radio 1"
                  label="9th Grade"
                  onChange={handleGrade}
                  checked={form["grade"] === "9"}
                  isInvalid={!!errors.grade}
                />
                <Form.Check
                  name="grade"
                  inline
                  value="10"
                  type="radio"
                  aria-label="radio 1"
                  label="10th Grade"
                  onChange={handleGrade}
                  checked={form["grade"] === "10"}
                  isInvalid={!!errors.grade}
                />
                <Form.Check
                  name="grade"
                  inline
                  value="11"
                  type="radio"
                  aria-label="radio 1"
                  label="11th Grade"
                  onChange={handleGrade}
                  checked={form["grade"] === "11"}
                  isInvalid={!!errors.grade}
                />
                <Form.Check
                  name="grade"
                  inline
                  value="12"
                  type="radio"
                  aria-label="radio 1"
                  label="12th Grade"
                  onChange={handleGrade}
                  checked={form["grade"] === "12"}
                  isInvalid={!!errors.grade}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.grade}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Select Gender</Form.Label>
                <Form.Control
                  as="select"
                  aria-label="Select Gender"
                  onChange={(e) => {
                    setField("gender", e.target.value);
                  }}
                  isInvalid={!!errors.gender}
                >
                  <option value="">Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.gender}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-4">
              <Form.Group as={Col}>
                <Form.Label>Youth Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Enter Youth Email"
                  onChange={(e) => {
                    setField("email", e.target.value.trim());
                  }}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row>
              <Col span="6">
                <Button
                  variant="primary"
                  type="submit"
                  onClick={saveInfo}
                  class="btn btn-primary btn-lg btn-block mb-3"
                >
                  Submit
                </Button>
              </Col>
              <Col span="6">
                <Button
                  variant="danger"
                  href="/parent"
                  class="btn btn-danger btn-lg btn-block mb-3"
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
      </div>
    </>
  );
};

export default ParentYouthApplication;
