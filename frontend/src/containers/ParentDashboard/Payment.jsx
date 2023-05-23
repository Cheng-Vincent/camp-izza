import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [balance, setBalance] = useState(0);
  const [parentID, setParentID] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // checks if user is logged in
    Axios.get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/login").then(
      (response) => {
        if (response) {
          if (response.data.loggedIn) {
            setParentID(response.data.user.user_id);
          } else {
            navigate("/login");
          }
        }
      }
    );
  }, []);

  useEffect(() => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/getBalance", {
      parent_id: parentID,
    })
      .then((response) => {
        setBalance(response.data.balance);
        if (balance % 0.01 != 0) {
          const newbalance = Number.parseFloat(balance).toFixed(2);
          setBalance(newbalance);
          //setValidBalance(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [parentID]);

  const initialOptions = {
    "client-id":
      "AeF50NsGLI4uYc-YyeHXXGl8ChC1-uOOmbrSMWEKNDU09LVj8pRXRfXnB6bBALj2C6-fUShNbncLedWd",
    currency: "USD",
    intent: "capture",
  };

  const createOrder = (data, actions, error) => {
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
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onApprove = async (data, actions) => {
    //console.log(balance);
    console.log(actions.order);

    return actions.order.capture().then(function (orderData) {
      // Three cases to handle:
      //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
      //   (2) Other non-recoverable errors -> Show a failure message
      //   (3) Successful transaction -> Show confirmation or thank you

      // This example reads a v2/checkout/orders capture response, propagated from the server
      // You could use a different API or structure for your 'orderData'
      var errorDetail =
        Array.isArray(orderData.details) && orderData.details[0];

      if (errorDetail && errorDetail.issue === "INSTRUMENT_DECLINED") {
        return actions.restart(); // Recoverable state, per:
        // https://developer.paypal.com/docs/checkout/integration-features/funding-failure/
      }

      if (errorDetail) {
        var msg = "Sorry, your transaction could not be processed.";
        if (errorDetail.description) msg += "\n\n" + errorDetail.description;
        if (orderData.debug_id) msg += " (" + orderData.debug_id + ")";
        return alert(msg); // Show a failure message (try to avoid alerts in production environments)
      }

      // Successful capture! For demo purposes:
      console.log(
        "Capture result",
        orderData,
        JSON.stringify(orderData, null, 2)
      );
      var transaction = orderData.purchase_units[0].payments.captures[0];
      alert("Transaction " + transaction.status + ": " + transaction.id);
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/updPayment", {
        parent_id: parentID,
      }).then((response) => {
        navigate("/parent");
      });
      // Replace the above to show a success message within this page, e.g.
      // const element = document.getElementById('paypal-button-container');
      // element.innerHTML = '';
      // element.innerHTML = '<h3>Thank you for your payment!</h3>';
      // Or go to another URL:  actions.redirect('thank_you.html');
    });
  };
  //capture likely error
  const onError = (data, actions) => {
    setErrorMessage("An Error occured with your payment ");
  };

  const onCancel = (data) => {
    // Show a cancel page, or return to cart
  };

  return (
    <>
      <div>
        <Button
          className="btn-lg ml-5 mt-5"
          variant="outline-primary"
          type="link"
          href="/parent"
        >
          BACK
        </Button>
        <h1 className="title">Payment</h1>
        <div className="title">You owe: ${balance}</div>
        <p></p>
        <div className="title">
          <PayPalScriptProvider options={initialOptions}>
            <div>
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                onCancel={onCancel}
              />
            </div>
          </PayPalScriptProvider>
        </div>
      </div>
    </>
  );
};

export default Payment;
