import React, { useMemo, useState, useEffect } from "react";
import Axios from "axios";
import Table from "../../components/Table";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";
import "./AdminDashboard.css";

const AdminCounselorReview = () => {
  const [data, setData] = useState([]);
  const [currentCounselor, setCounselor] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // checks if user is logged in
    Axios.post(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/counselorData"
    ).then((response) => {
      // console.log(response.data.data)
      setData(response.data.data);
    });
  }, []);

  const handleClick = (row) => {
    setCounselor(row.original);
    console.log(row.original);
    setShowModal(true);
  };

  const remove = (counselorid) => {
    const arrayCopy = data.filter((row) => row.counselorid !== counselorid);
    setData(arrayCopy);
  };

  const handleAccept = (counselorid) => {
    setShowModal(false);
    Axios.post(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/changeCounselorStatus",
      {
        counselorid: counselorid,
        status: "Accepted",
      }
    ).then((response) => {
      remove(counselorid);
      alert(response.data.message);
    });
  };

  const handleDeny = (counselorid) => {
    setShowModal(false);
    Axios.post(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/changeCounselorStatus",
      {
        counselorid: counselorid,
        status: "Denied",
      }
    ).then((response) => {
      remove(counselorid);
      alert(response.data.message);
    });
  };

  const downloadTextFile = () => {
    Axios.get(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/counselorExport"
    ).then((counselors) => {
      const texts = JSON.parse(counselors.data);

      var json = [Object.keys(texts[0])].concat(texts);
      var csvData = json
        .map((it) => {
          return Object.values(it).toString();
        })
        .join("\n");

      // file object
      const file = new Blob([csvData], {
        type: "data:text/csv;charset=utf-8;",
      });

      // anchor link
      const element = document.createElement("a");
      element.href = URL.createObjectURL(file);
      element.download = "counselors-" + Date.now() + ".csv";

      // simulate link click
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    });
  };

  const columns = useMemo(() => [
    {
      Header: "Pending Applications",
      columns: [
        {
          Header: "First Name",
          accessor: "first_name",
        },
        {
          Header: "Last Name",
          accessor: "last_name",
        },
        {
          Header: "Gender",
          accessor: "gender",
        },
        {
          Header: "Birthday",
          accessor: "birthday",
        },
        {
          Header: "Application",
          Cell: ({ row }) => (
            <Button onClick={() => handleClick(row)}>Details</Button>
          ),
        },
      ],
    },
  ]);

  return (
    <>
      <Row className="text-center mx-auto mb-4">
        <Col>
          <h1 style={{ fontSize: "1.3rem", color: "#e2e4ee" }}>
            Application Review
          </h1>
        </Col>
      </Row>
      <Row className="d-flex justify-content-center">
        <Col className="d-flex justify-content-center">
          <Table columns={columns} data={data}></Table>
        </Col>
      </Row>
      <Row className="mt-3 mb-3">
        <Col className="text-center">
          <Container
            as={Button}
            variant="light"
            style={{
              "border-radius": "15px",
              width: "10rem",
              border: "3px solid #5489b8",
            }}
            onClick={downloadTextFile}
          >
            <h2 className="my-1 mx-auto" style={{ fontSize: "0.9rem" }}>
              Download .csv
            </h2>
          </Container>
        </Col>
      </Row>
      <div>
        <Modal
          className="details-modal"
          show={showModal}
          onHide={() => {
            setShowModal(false);
          }}
          backdrop="static"
          keyboard={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Counselor Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-2">
              <Col>Name: </Col>
              <Col>
                <b>
                  {currentCounselor.first_name +
                    " " +
                    currentCounselor.last_name}
                </b>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>Location: </Col>
              <Col>
                <b>{currentCounselor.city}</b>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>Phone Number: </Col>
              <Col>
                <b>{currentCounselor.phone_number}</b>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>Gender: </Col>
              <Col>
                <b>{currentCounselor.gender}</b>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>Shirt Size: </Col>
              <Col>
                <b>{currentCounselor.shirt_size}</b>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>Birthday: </Col>
              <Col>
                <b>{currentCounselor.birthday}</b>
              </Col>
            </Row>
            <Modal.Footer>
              <Button
                onClick={() => {
                  handleAccept(currentCounselor.counselorid);
                }}
              >
                Accept
              </Button>
              <Button
                onClick={() => {
                  handleDeny(currentCounselor.counselorid);
                }}
              >
                Deny
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default AdminCounselorReview;
