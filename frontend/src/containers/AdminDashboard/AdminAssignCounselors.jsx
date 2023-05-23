import React, { useMemo, useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";
import "./AdminDashboard.css";

const AdminAssignCounselors = () => {
  const [data, setData] = useState([]);
  const [parentID, setParentID] = useState(0);
  const navigate = useNavigate();
  const [currentCounselor, setCounselor] = useState([]);
  const [busList, setBus] = useState([]);
  const [cabinList, setCabin] = useState([]);
  const [genderCabin, setGenderCabin] = useState([]);
  const [familyList, setFamily] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [busID, setBusID] = useState("");
  const [cabinID, setCabinID] = useState("");
  const [familyID, setFamilyID] = useState("");

  useEffect(() => {
    Axios.post(
      process.env.REACT_APP_YSS_BACKEND_SERVER + "/approvedCounselors"
    ).then((response) => {
      setData(response.data.data);
    });
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/listGroups").then(
      (res) => {
        setBus(res.data.busList);
        setCabin(res.data.cabinList);
        setFamily(res.data.familyList);
      }
    );
  }, []);

  const handleClick = (row) => {
    setCounselor(row.original);
    var tempCabin = [];
    for (var x = 0; x < cabinList.length; x++) {
      if (cabinList[x].gender == row.original.gender) {
        tempCabin.push(cabinList[x]);
      }
    }
    setGenderCabin(tempCabin);
    setShowModal(true);
  };

  const remove = (counselorid) => {
    const arrayCopy = data.filter((row) => row.counselorid !== counselorid);
    setData(arrayCopy);
  };

  const handleAccept = (counselorid) => {
    if (busID == "" || cabinID == "" || familyID == "") {
      alert("Please assign all groups.");
    } else {
      setShowModal(false);
      Axios.post(
        process.env.REACT_APP_YSS_BACKEND_SERVER + "/assignCounselor",
        {
          counselorid: counselorid,
          busID: busID,
          cabinID: cabinID,
          familyID: familyID,
        }
      ).then((response) => {
        alert(response.data.message);
        Axios.post(
          process.env.REACT_APP_YSS_BACKEND_SERVER + "/approvedCounselors"
        ).then((response) => {
          setData(response.data.data);
        });
      });
    }
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
      Header: "Approved Counselors",
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
          Header: "Bus",
          accessor: "bus_name",
        },
        {
          Header: "Cabin",
          accessor: "cabin_name",
        },
        {
          Header: "Family",
          accessor: "family_name",
        },
        {
          Header: "Assign Groups",
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
            Assign Counselors
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
            <Modal.Title>Approved Counselor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row className="mb-3">
                <Form.Group controlId="formBasicSelect">
                  <Form.Label>Assign Bus</Form.Label>
                  <Form.Control
                    as="select"
                    value={busID}
                    onChange={(e) => {
                      setBusID(e.target.value);
                    }}
                  >
                    <option value="">Open this select menu</option>
                    {busList.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group controlId="formBasicSelect">
                  <Form.Label>Assign Cabin</Form.Label>
                  <Form.Control
                    as="select"
                    value={cabinID}
                    onChange={(e) => {
                      setCabinID(e.target.value);
                    }}
                  >
                    <option value="">Open this select menu</option>
                    {genderCabin.map((cabin) => (
                      <option key={cabin.id} value={cabin.id}>
                        {cabin.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group controlId="formBasicSelect">
                  <Form.Label>Assign Family</Form.Label>
                  <Form.Control
                    as="select"
                    value={familyID}
                    onChange={(e) => {
                      setFamilyID(e.target.value);
                    }}
                  >
                    <option value="">Open this select menu</option>
                    {familyList.map((family) => (
                      <option key={family.id} value={family.id}>
                        {family.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Row>
            </Form>
            <Modal.Footer>
              <Button
                type="submit"
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

export default AdminAssignCounselors;
