import React, { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import "./Payment.css";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [success, setSuccess] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState("");
  const [orderID, setOrderID] = useState(false);
  const [balance, setBalance] = useState(0);
  const [parentID, setParentID] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // checks if user is logged in
    Axios.get("/api/login").then((response) => {
      if (response) {
        if (response.data.loggedIn) {
          setParentID(response.data.user.user_id);
        } else {
          navigate("/login");
        }
      }
    });
  }, []);

  useEffect(() => {
    Axios.post("/api/getBalance", { parent_id: parentID })
      .then((response) => {
        setBalance(response.data.balance);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            description: "YouthPayment",
            amount: {
              currency_code: "USD",
              value: balance,
            },
          },
        ],
        // not needed if a shipping address is actually needed
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => {
        setOrderID(orderID);
        return orderID;
      });
  };

  const onApprove = (data, actions) => {
    //console.log(balance);
    console.log("approved");
    Axios.post("/api/updPayment");
    return actions.order.capture().then(function (details) {
      const { payer } = details;
      setSuccess(true);
      alert("Thank you for paying your youth's application.");
      navigate("/parentdashboard");
    });
  };
  //capture likely error
  const onError = (data, actions) => {
    setErrorMessage("An Error occured with your payment ");
  };

  return (
    <>
      <div>
        <Button className="btn-lg ml-5 mt-5" variant="outline-primary" type="link" href="/parentdashboard">BACK</Button>
        <h1 className="title">Payment</h1>
        <div className="title">You owe: ${balance}</div>
        <p></p>
        <div className="title">
          <PayPalScriptProvider
            options={{
              "client-id": "test",
            }}
          >
            <div>
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={createOrder}
                onApprove={onApprove}
              />
            </div>
          </PayPalScriptProvider>

          <a href="/financial_aid" className="btn btn-warning mb-3">
            Apply for Financial Aid
          </a>
        </div>
      </div>
    </>
  );
};

export default Payment;
