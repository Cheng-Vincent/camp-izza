import React, { useEffect, useState } from "react";
import "./Financial_Aid.css";
import { Link } from "react-router-dom";
import Axios from "axios";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";

const Financial_Aid = () => {
  const [income, setIncome] = useState("");
  const [household, setHousehold] = useState("");
  const [total, setPrice] = useState("");
  const [orgs, setOrgs] = useState("");
  const [circumstance, setCirc] = useState("");
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    Axios.post("/api/payment", { balance }).then(
      (response) => {
        setBalance(response.data.balance);
      }
    );
  });

  const insertFinancial_aid = () => {
    Axios.post("/api/financial_aid", {
      household: household,
      income: income,
      total: total,
      orgs: orgs,
      circumstance: circumstance,
    })
      .catch((error) => {
        console.log(error);
      })
      .then((response) => {
        console.log(response);
        console.log("saving information");
      });
  };

  const submitForm = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      insertFinancial_aid();
    }
    setValidated(true);
    alert(
      "Your financial aid application has been submitted and will be processed."
    );
    navigate("/parentdashboard");
  };

  return (
    <>
      <div className="title">
        <h1>Financial Aid Application</h1>
      </div>

      <br />

      <Form
        className="questions"
        noValidate
        validated={validated}
        onSubmit={submitForm}
      >
        <div>
          <h4>Financial Information</h4>
        </div>
        <div className="mb-3">
          <label className="col-form-label">
            How many people live in your household?*
          </label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => {
              setHousehold(e.target.value);
            }}
            required
          ></input>
        </div>
        <div className="mb-3">
          <label className="col-form-label">
            What is your total annual family household income? (combined income
            of everyone in the household)*
          </label>
          <div></div>
          <select
            className="form-select"
            onChange={(e) => {
              setIncome(e.target.value);
            }}
            required
          >
            <option defaultValue>Select Income</option>
            <option>Below $30,000</option>
            <option>$30,000 - $39,999</option>
            <option>$40,000 - $49,999</option>
            <option>$50,000 - $59,999</option>
            <option>$60,000 or above</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="col-form-label">
            How much of the ${balance} registration fee are you able to pay?*
          </label>
          <input
            className="form-control"
            type="float price"
            onChange={(e) => {
              setPrice(e.target.value);
            }}
            required
          ></input>
        </div>
        <div className="mb-3">
          <label className="col-form-label">
            What local organizations (e.g. masjids) do you attend? The Youth
            Spiritual Summit will reach out to these organizations to see if
            they will support local youth to attend the Summit. If none, please
            type N/A.*
          </label>
          <input
            className="form-control"
            onChange={(e) => {
              setOrgs(e.target.value);
            }}
            required
          ></input>
        </div>
        <div className="mb-3">
          <label className="col-form-label">
            Provide a brief description of the circumstances that lead you to
            request financial aid.*
          </label>
          <input
            className="form-control"
            onChange={(e) => {
              setCirc(e.target.value);
            }}
            required
          ></input>
        </div>
        <div className="mb-3">
          <label className="col-form-label">
            The Youth Spiritual Summit is a non-profit organization and everyone
            involved is a volunteer who earns no financial compensation for
            their participation. All funds made from the registration fees go
            into the cost of running the program. The Youth Spiritual Summit is
            committed to supporting every youth who wishes to attend this
            program, regardless of their financial means. By completing this
            application, the youth and family of the youth are committed to
            seeking sponsorship from local organizations and/or individuals who
            can support the program. By completing this application, you are
            assuming responsibility for finding the funding to attend the Youth
            Spiritual Summit. The Youth Spiritual Summit will assist you in
            identifying funding sources and in telling your story to those who
            may be able to assist. Someone from the Youth Spiritual Summit will
            be in touch with you to support and advise you on the work ahead. *
          </label>
          <div className="form-check">
            <input className="form-check-input" type="radio" required></input>
            <label className="form-check-label">
              I agree to the statement above
            </label>
          </div>
        </div>
        <br />
        <Link to="/payment">
          <button type="button" className="btn btn-secondary">
            Back
          </button>
        </Link>
        <button type="submit" className="btn btn-warning">
          Submit
        </button>
      </Form>
    </>
  );
};

export default Financial_Aid;
