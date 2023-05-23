import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import yss_logo_blue from "../../assets/yss-logo.png";
import "./ParentDashboard.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const ParentDashboard = () => {
  const [youthInfo, setYouthInfo] = useState([]);
  const [parentID, setParentID] = useState();
  const [balance, setBalance] = useState("");
  const [parentFormSubmitted, setParentFormSubmitted] = useState(false);
  const [payButton, setPayButton] = useState("btn btn-primary mb-3");
  const [fAidSubmitted, setFAid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // checks if user is logged in
    axios
      .get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/login")
      .then((response) => {
        if (response.data.loggedIn) {
          if (response.data.user.account_type === "parent")
            setParentID(response.data.user.user_id);
          else {
            navigate(`/${response.data.user.account_type}`);
          }
        } else {
          navigate("/login");
        }
      });
  }, []);

  useEffect(() => {
    axios
      .post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/parentdashboard", {
        parent_id: parentID,
      })
      .then((response) => {
        setYouthInfo(response.data.youthInfo);
        setBalance(": $" + response.data.balance);
        setParentFormSubmitted(response.data.parentDetailsCompleted);
        setFAid(response.data.financialAid);
        if (response.data.balance == 0)
          setPayButton("btn btn-primary mb-3 disabled");
        else setPayButton("btn btn-primary mb-3");
      });
  }, [parentID]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/login";
    alert("Logged out!");
  };

  return (
    <div>
      <div className="container p-5">
        <div style={{ textAlign: "center" }}>
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

        {/*Logout*/}
        <div className="text-right p-2">
          <button className="btn btn-sm text-dark" onClick={handleLogout}>
            <b>Logout</b>
          </button>
        </div>

        {/*/!* Youth information *!/*/}
        {/*<div className="card w-auto mb-4 ">*/}
        {/*    <div className="card-header">*/}
        {/*        <h2>Registered Youth</h2>*/}
        {/*    </div>*/}
        {/*    <div className="card-body">*/}
        {/*        <a href="/youthregistration" className="btn btn-primary mb-3">*/}
        {/*            Add Youth*/}
        {/*        </a>*/}
        {/*        {youthInfo.length > 0 ? (*/}
        {/*            <div className="accordion accordion-flush" id="accordionFlushExample">*/}
        {/*                {youthInfo.map((youth, index) => (*/}
        {/*                    <div className="accordion-item" key={index}>*/}
        {/*                        <h2 className="accordion-header" id={`flush-heading-${index}`}>*/}
        {/*                            <button className="accordion-button collapsed" type="button"*/}
        {/*                                    data-bs-toggle="collapse"*/}
        {/*                                    data-bs-target={`#flush-collapse-${index}`} aria-expanded="false"*/}
        {/*                                    aria-controls={`flush-collapse-${index}`}*/}
        {/*                                    data-bs-parent="accordionFlushExample">*/}
        {/*                                <h4>*/}
        {/*                                    {`${youth.firstName} ${youth.lastName}`}*/}
        {/*                                </h4>*/}
        {/*                            </button>*/}
        {/*                        </h2>*/}
        {/*                        Open this after this quarter */}
        {/*                        <div id={`flush-collapse-${index}`} className="accordion-collapse collapse"*/}
        {/*                             aria-labelledby={`flush-heading-${index}`}*/}
        {/*                             data-bs-parent="#accordionFlushExample">*/}
        {/*                            <div className="accordion-body">*/}
        {/*                                <h5>*/}
        {/*                                    /!*any additional details*!/*/}
        {/*                                    Family group: {`${youth.family}`}*/}
        {/*                                    <br/>*/}
        {/*                                    Cabin: {`${youth.cabin}`}*/}
        {/*                                    <br/>*/}
        {/*                                    Bus: {`${youth.bus}`}*/}
        {/*                                </h5>*/}

        {/*                            </div>*/}
        {/*                        </div>*/}
        {/*                    </div>*/}
        {/*                ))}*/}
        {/*            </div>*/}
        {/*        ) : (*/}
        {/*            <p className="card-text text-center">*/}
        {/*                <h4>No youth registered yet</h4>*/}
        {/*            </p>*/}
        {/*        )}*/}
        {/*    </div>*/}
        {/*</div>*/}

        {/*I want to keep this for now */}
        <Card className="mb-4 mx-auto">
          <Card.Body>
            <Card.Title>Complete Parent/Guardian Details Form</Card.Title>
            <Button
              variant="danger"
              type="link"
              href="/parent/detailsform"
              disabled={parentFormSubmitted}
            >
              Submit
            </Button>
          </Card.Body>
        </Card>

        <div className="card w-auto mb-4 ">
          <div className="card-header">
            <h2>Registered Youth</h2>
          </div>

          <div className="card-body">
            <a href="/parent/youthapplication" className="btn btn-primary mb-3">
              Add Youth
            </a>

            {/*original kept*/}
            {youthInfo.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    {/*<th scope="col">Youth Name</th>*/}
                    {/*<th scope="col">Age</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {youthInfo.map((youth) => (
                    <tr key={youth.youth_id}>
                      <td className="text-center">
                        <h4>
                          {youth.firstName} {youth.lastName}
                        </h4>
                      </td>
                      {/*<td>{youth.age}</td>*/}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="card-text text-center">
                <h4>No youth registered yet</h4>
              </p>
            )}
          </div>
        </div>

        {/*Balance Information*/}
        <div className="card w-auto mb-4 ">
          <div className="card-header">
            <h2>Balance</h2>
          </div>

          <div className="card-body">
            <Row className="mx-auto mb-4">
              <h4 className="text-center"> Balance Due {balance} </h4>
            </Row>
            <Row className="mx-auto mb-4">
              <Stack gap={2}>
                <Button href="/parent/payment" className={payButton}>
                  Pay Now
                </Button>
                <Button
                  href="/parent/financialaid"
                  disabled={fAidSubmitted | (balance === 0)}
                  className="btn"
                >
                  Financial Aid Form
                </Button>
              </Stack>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
