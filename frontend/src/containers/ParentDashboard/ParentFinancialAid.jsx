import React, { useEffect, useState } from "react";
import Axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import yss_logo_blue from "../../assets/yss-logo.png";
import { useNavigate } from "react-router-dom";

const ParentFinancialAid = () => {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [parentID, setParentID] = useState("");
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // checks if user is logged in
    Axios.get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/login").then(
      (response) => {
        if (response.data.loggedIn) {
          setParentID(response.data.user.user_id);
        } else {
          navigate("/login");
        }
      }
    );
  }, []);

  useEffect(() => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/getBalance", {
      parent_id: parentID,
    }).then((response) => {
      setBalance(response.data.balance);
    });
  }, [parentID]);

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
    const { household, income, canPay, orgs, circumstances } = form;
    const newErrors = {};
    if (!household || household === "")
      newErrors.household = "Household size required";
    else if (!/^\d+$/.test(household))
      newErrors.household = "Please enter only digits";
    if (!income || income === "")
      newErrors.income = "Household income required";
    if (!canPay || canPay === "")
      newErrors.canPay = "Please specify the amount you can pay";
    if (!orgs || orgs === "")
      newErrors.orgs = "Please list organizations you're a part of or type N/A";
    if (!circumstances || circumstances === "")
      newErrors.circumstances = "Please describe your circumstances";
    return newErrors;
  };

  const submitForm = () => {
    Axios.post(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/submitFinancialAidApp",
      {
        parent_id: parentID,
        household: form.household,
        income: form.income,
        total: form.canPay,
        orgs: form.orgs,
        circumstance: form.circumstances,
        submitted_at: new Date(),
      }
    ).then((response) => {
      alert(response.data.message);
      navigate("/parent");
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = findFormErrors();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      submitForm();
    }
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
            <h1>Financial Aid Application</h1>
          </Col>
        </Row>

        <Row className="mx-auto">
          <Form as={Col}>
            <Row className="mb-4">
              <Form.Group as={Col}>
                <Form.Label>
                  How many people live in your household? *
                </Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.household}
                  onChange={(e) => {
                    setField("household", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.household}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Form.Group as={Col}>
                <Form.Label>
                  What is your total annual family household income? (combined
                  income of everyone in the household)*
                </Form.Label>
                <Form.Control
                  required
                  as="select"
                  aria-label="Select Income"
                  isInvalid={!!errors.income}
                  onChange={(e) => {
                    setField("income", e.target.value);
                  }}
                >
                  <option defaultValue>Select Income</option>
                  <option>Below $30,000</option>
                  <option>$30,000 - $39,999</option>
                  <option>$40,000 - $49,999</option>
                  <option>$50,000 - $59,999</option>
                  <option>$60,000 or above</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.income}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Form.Group as={Col}>
                <Form.Label>
                  How much of the ${balance} registration fee are you able to
                  pay?*
                </Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.canPay}
                  onChange={(e) => {
                    setField("canPay", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.canPay}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Form.Group as={Col}>
                <Form.Label>
                  What local organizations (e.g. masjids) do you attend? The
                  Youth Spiritual Summit will reach out to these organizations
                  to see if they will support local youth to attend the Summit.
                  If none, please type N/A.*
                </Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.orgs}
                  onChange={(e) => {
                    setField("orgs", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.orgs}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Form.Group as={Col}>
                <Form.Label>
                  Provide a brief description of the circumstances that lead you
                  to request financial aid.*
                </Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.circumstances}
                  onChange={(e) => {
                    setField("circumstances", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.circumstances}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Col>
                <label>
                  The Youth Spiritual Summit is a non-profit organization and
                  everyone involved is a volunteer who earns no financial
                  compensation for their participation. All funds made from the
                  registration fees go into the cost of running the program. The
                  Youth Spiritual Summit is committed to supporting every youth
                  who wishes to attend this program, regardless of their
                  financial means. By completing this application, the youth and
                  family of the youth are committed to seeking sponsorship from
                  local organizations and/or individuals who can support the
                  program. By completing this application, you are assuming
                  responsibility for finding the funding to attend the Youth
                  Spiritual Summit. The Youth Spiritual Summit will assist you
                  in identifying funding sources and in telling your story to
                  those who may be able to assist. Someone from the Youth
                  Spiritual Summit will be in touch with you to support and
                  advise you on the work ahead. *
                </label>
                <Form.Check
                  required
                  name="agree"
                  label="I agree to the statement above."
                  type="radio"
                ></Form.Check>
              </Col>
            </Row>
            <Row>
              <Button type="link" href="/parent" className="btn btn-secondary">
                Back
              </Button>
              <Button
                type="submit"
                className="btn btn-primary submit-button"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Row>
          </Form>
        </Row>
      </div>
    </>
  );
};

export default ParentFinancialAid;
