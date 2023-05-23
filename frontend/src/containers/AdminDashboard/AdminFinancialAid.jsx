import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Axios from "axios";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";

const AdminFinancialAid = () => {
  //const [colorButton, setcolorButton] = useState("primary");
  const [financialList, setFinancialList] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [parentInfo, setParentInfo] = useState({});
  const [youthInfoList, setYouthInfo] = useState([]);
  const [youthInfo, setYouth] = useState([]);
  const [showAlert, setAlert] = useState(false);
  const alertClose = () => setAlert(false);
  const alertShow = () => setAlert(true);
  const [form, setForm] = useState({});
  const [deny, setDeny] = useState(false);
  const denyClose = () => setDeny(false);
  const denyShow = () => setDeny(true);

  useEffect(() => {
    // checks if user is logged in
    Axios.post(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/getfinancialApps"
    ).then((response) => {
      setFinancialList(response.data.financial_apps);
      setYouthInfo(response.data.youthDetails);
      //console.log(response.data.youthDetails)
      console.log(response.data);
    });
  }, []);

  const setField = (field, value) => {
    console.log("id is: ", field);
    setForm({
      ...form,
      [field]: value,
    });
  };
  const setColor = (color) => {
    if (color === "pending") {
      return "primary";
    } else if (color === "approved") {
      return "success";
    } else {
      return "danger";
    }
  };

  const disableButton = (status) => {
    if (status === "pending") {
      return false;
    } else {
      return true;
    }
  };

  const renderTable = () => {
    return (
      <Table variant="light" hover responsive striped bordered>
        {renderHeader()}
        <tbody>{renderUsers()}</tbody>
      </Table>
    );
  };

  const renderHeader = () => {
    return (
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Phone Number</th>
          <th>Email</th>
          <th>Balance</th>
          <th>Status</th>
          <th>View</th>
        </tr>
      </thead>
    );
  };

  const renderUsers = () => {
    return financialList.map(
      ({ id, first, last, phone, email, balance, status }) => {
        const [bal, setBalance] = " ";
        return (
          <tr key={id}>
            {/* <div> */}
            <td>{first}</td>
            <td>{last}</td>
            <td>{phone}</td>
            <td>{email}</td>
            <td>
              <Form.Group className="mb-3" controlId="newBalance">
                <Form.Control
                  placeholder={balance}
                  disabled={disableButton(status)}
                  onChange={(e) => {
                    setField("balance", e.target.value.trim());
                  }}
                />
              </Form.Group>
            </td>
            <td>
              {/*<Form.Select aria-label="Default select example">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </Form.Select>*/}
              <DropdownButton
                variant={setColor(status)}
                title={status}
                disabled={disableButton(status)}
              >
                <Dropdown.Item onClick={(e) => setInfo(id, "balance")}>
                  Approved
                </Dropdown.Item>
                <Dropdown.Item onClick={(e) => setInfo(id, "deny")}>
                  Denied
                </Dropdown.Item>
              </DropdownButton>
            </td>
            <td>
              <Button variant="primary" onClick={(e) => setInfo(id, "view")}>
                View
              </Button>
            </td>
          </tr>
        );
      }
    );
  };
  const setInfo = (id, modalView) => {
    //const parentID = ''
    for (let i = 0; i < financialList.length; i++) {
      //console.log(financialList[i])
      if (financialList[i].id == id) {
        //console.log(financialList[i])
        setParentInfo(financialList[i]);
        //parentID = financialList[i].id
      }
    }
    if (modalView == "view") {
      const youth = [];
      for (let i = 0; i < youthInfoList.length; i++) {
        if (youthInfoList[i].parentID == id) {
          youth.push(youthInfoList[i]);
        }
      }
      console.log(youthInfoList);
      setYouth(youth);
      //console.log(parentInfo.id)
      console.log("youthInfo: " + youthInfo);
      handleShow();
    } else if (modalView == "deny") {
      console.log("you are denying application");
      denyShow();
    } else {
      alertShow();
    }
  };

  const viewInfo = () => {
    if (parentInfo == {}) {
      return;
    }
    //console.log(info)
    //console.log(info.id)
    //console.log(info.household_size)
    console.log(youthInfo);
    return (
      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {parentInfo.first} {parentInfo.last}'s Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                Youths:
                {/* {listYouths()} */}
                {youthInfo.map(({ first, last, grade }) => {
                  return (
                    <div>
                      <div>
                        {first} {last}
                      </div>
                      <div>Grade: {grade}</div>
                    </div>
                  );
                })}
              </Col>
              <Col>
                Answers:
                <div>How many people live in your household?</div>
                <div>{parentInfo.household_size}</div>
                <div>Income: {parentInfo.annual_income}</div>
                <div>Able to pay: {parentInfo.able_to_pay}</div>
                <div>Local organizations attended:</div>
                <div>{parentInfo.local_org}</div>
                <div>Description of circumstances:</div>
                <div>{parentInfo.circ_desc}</div>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  const balanceAlert = () => {
    //console.log("goes through balanceAlert")
    //alertShow()
    return (
      <>
        <Modal
          show={showAlert}
          onHide={alertClose}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              You are changing {parentInfo.first}'s balance.
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to change {parentInfo.first}'s balance to{" "}
            {form.balance}?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={alertClose}>
              No
            </Button>
            <Button variant="primary" onClick={(e) => updateBalance()}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  const denyAlert = () => {
    //console.log("goes through balanceAlert")
    //alertShow()
    return (
      <>
        <Modal
          show={deny}
          onHide={denyClose}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              You are denying {parentInfo.first}'s Financial Aid Application
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to deny their application? You will not be
            able to change it after denying.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={denyClose}>
              No
            </Button>
            <Button variant="primary" onClick={(e) => denyApplication()}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  const denyApplication = () => {
    console.log("denying app");
    Axios.post(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/denyFinancialApplication",
      {
        parentID: parentInfo.id,
        status: "denied",
      }
    ).then((response) => {
      console.log("comes back from backend");
    });
    denyClose();
    window.location.reload(true);
  };

  const updateBalance = () => {
    // event.preventDefault();
    console.log("updating balance");
    console.log(parentInfo.id);
    Axios.post(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/updateParentBalance",
      {
        parentID: parentInfo.id,
        balance: form.balance,
        status: "approved",
      }
    ).then((response) => {
      console.log("comes back from backend");
    });
    alertClose();
    window.location.reload(true);
  };

  return (
    <div class="body">
      <Row className="mt-3">
        <HeaderLogo href="/admin" />
      </Row>

      <div className="admin-container mx-auto py-3">
        <Row className="mx-auto mt-3">
          <Col className="text-left">
            <CustomButton text="Back" href="/admin" />
          </Col>
        </Row>

        <Row className="text-center mx-auto">
          <Col>
            <h1 style={{ fontSize: "1.7rem", color: "#e2e4ee" }}>
              Financial Aid Applications
            </h1>
          </Col>
        </Row>

        <Row>
          <Col>
            <div style={{ margin: "50px" }}>
              {renderTable()}
              {viewInfo()}
              {balanceAlert()}
              {denyAlert()}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminFinancialAid;
