import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";

const YouthGroupSelection = () => {
  const [youthID, setYouthID] = useState();
  const navigate = useNavigate();

  //For displaying members in the group
  const [familyList, setFamilyList] = useState([]);
  const [busList, setBusList] = useState([]);
  const [cabinList, setCabinList] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(false);
  const [selectedBus, setSelectedBus] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState(false);

  //join button states
  const [familyJoined, setFamilyJoined] = useState(false);
  const [busJoined, setBusJoined] = useState(false);
  const [cabinJoined, setCabinJoined] = useState(false);

  //For displaying the modal
  //when adding more graphics on the list items
  // const [showBus, setShowBus] = useState(false);
  // const [showFamily, setShowFamily] = useState(false);
  // const [showCabin, setShowCabin] = useState(false);

  useEffect(() => {
    // Check if user is logged in and has a valid session
    axios
      .get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/login")
      .then((response) => {
        if (response.data.loggedIn) {
          setYouthID(response.data.user.user_id);
        } else {
          navigate("/login");
        }
      });

    // Fetch groups data
    axios
      .post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/groupdisplay", {
        youthID: youthID,
        //youthID: "99999a"
      })
      .then((response) => {
        setFamilyList(response.data.familyList);
        setBusList(response.data.busList);
        setCabinList(response.data.cabinList);
      });
  }, [youthID]);

  const handleJoinFamily = () => {
    setFamilyJoined(true);
  };

  const handleJoinBus = () => {
    setBusJoined(true);
  };

  const handleJoinCabin = () => {
    setCabinJoined(true);
  };

  const handleSubmit = () => {
    let notJoined = [];
    if (!familyJoined) {
      notJoined.push("Family");
    }
    if (!busJoined) {
      notJoined.push("Bus");
    }
    if (!cabinJoined) {
      notJoined.push("Cabin");
    }
    if (notJoined.length > 0) {
      alert(`Please join the following groups: ${notJoined.join(", ")}`);
      return;
    }

    // Submit selected group information to server using Axios
    axios
      .post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/groupselection", {
        //getting youth ID from the session
        youthID: youthID,

        // youthID: "99999a",
        familyID: selectedFamily.id,
        busID: selectedBus.id,
        cabinID: selectedCabin.id,
      })
      .then((response) => {
        // Handle success response
        console.log(response.data); // log response data

        // show success message to user
        alert("Group selection submitted successfully!");

        // navigate to dashboard
        // navigate("/youth");
      })
      .catch((error) => {
        // Handle error response
        console.error(error);

        // show error message to user
        alert("Error submitting group selection. Please try again.");
      });
  };

  return (
    <div class="body">
      <Row className="mt-3">
        <HeaderLogo href="/youth" />
      </Row>

      <div className="admin-container mx-auto py-3 mb-5">
        <Row className="mx-auto mt-3">
          <Col className="text-left">
            <CustomButton text="Back" href="/youth" />
          </Col>
        </Row>
        <Row className="mx-auto mt-3">
          <Tab.Container defaultActiveKey="family">
            <Row>
              <Col sm={2}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="family">Family</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="bus">Bus </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="cabin">Cabin </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="family">
                    <Card>
                      <Card.Header>
                        <h4>Family</h4>
                      </Card.Header>
                      <Card.Body>
                        <Card.Text>
                          Select your family from the list below:
                        </Card.Text>
                        <ListGroup>
                          {familyList.map((family, index) => (
                            <ListGroup.Item
                              key={family.name}
                              active={selectedFamily.name === family.name}
                              onClick={() => setSelectedFamily(family)}
                              disabled={family.isFull}
                            >
                              <Row>
                                <Col>Family {family.name}</Col>
                                <Col>
                                  Capacity: {family.members.length}/
                                  {family.capacity}
                                </Col>
                              </Row>
                              <Row>
                                <Col>Counselor:</Col>
                              </Row>
                              {family.members.length > 0 &&
                                selectedFamily.name === family.name && (
                                  <ListGroup>
                                    {family.members.map((member, i) => (
                                      <ListGroup.Item key={i}>
                                        {member.firstName} {member.lastName}
                                      </ListGroup.Item>
                                    ))}
                                  </ListGroup>
                                )}
                              {family.isFull && (
                                <span className="text-danger"> - Full</span>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        {!familyJoined && (
                          <Button
                            className="mt-3"
                            onClick={() => handleJoinFamily()}
                            disabled={
                              !selectedFamily ||
                              familyList.find(
                                (family) => family.name === selectedFamily.name
                              ).isFull
                            }
                          >
                            Join Family {selectedFamily.name}
                          </Button>
                        )}
                        {familyJoined && (
                          <div className="mt-3">
                            <p>You have joined Family {selectedFamily.name}.</p>
                            <Button variant="secondary" disabled>
                              Joined Family {selectedFamily.name}
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane eventKey="bus">
                    <Card>
                      <Card.Header>
                        <h4>Bus</h4>
                      </Card.Header>
                      <Card.Body>
                        <Card.Text>
                          Select your bus from the list below:
                        </Card.Text>
                        <ListGroup>
                          {busList.map((bus) => (
                            <ListGroup.Item
                              key={bus.name}
                              active={selectedBus.name === bus.name}
                              onClick={() => setSelectedBus(bus)}
                              disabled={bus.isFull}
                            >
                              <Row>
                                <Col>{bus.name} Bus</Col>
                                <Col>
                                  Capacity: {bus.members.length}/{bus.capacity}
                                </Col>
                              </Row>
                              <Row>
                                <Col>Counselor:</Col>
                              </Row>
                              {bus.members.length > 0 &&
                                selectedBus.name === bus.name && (
                                  <ListGroup>
                                    {bus.members.map((member, i) => (
                                      <ListGroup.Item key={i}>
                                        {member.firstName} {member.lastName}
                                      </ListGroup.Item>
                                    ))}
                                  </ListGroup>
                                )}
                              {bus.isFull && (
                                <span className="text-danger"> - Full</span>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>

                        {!busJoined && (
                          <Button
                            className="mt-3"
                            onClick={() => handleJoinBus()}
                            disabled={
                              !selectedBus ||
                              busList.find(
                                (bus) => bus.name === selectedBus.name
                              ).isFull
                            }
                          >
                            Join {selectedBus.name} Bus
                          </Button>
                        )}
                        {busJoined && (
                          <div className="mt-3">
                            <p>You have joined {selectedBus.name} bus.</p>
                            <Button variant="secondary" disabled>
                              Joined {selectedBus.name} Bus
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane eventKey="cabin">
                    <Card>
                      <Card.Header>
                        <h4>Cabin </h4>
                      </Card.Header>
                      <Card.Body>
                        <Card.Text>
                          Select your cabin from the list below:
                        </Card.Text>
                        <ListGroup>
                          {cabinList.map((cabin, index) => (
                            <ListGroup.Item
                              key={cabin.name}
                              active={selectedCabin.name === cabin.name}
                              onClick={() => setSelectedCabin(cabin)}
                              disabled={cabin.isFull}
                            >
                              <Row>
                                <Col>Cabin {cabin.name}</Col>
                                <Col>
                                  Capacity: {cabin.members.length}/
                                  {cabin.capacity}
                                </Col>
                              </Row>
                              <Row>
                                <Col>Counselor:</Col>
                              </Row>
                              {cabin.members.length > 0 &&
                                selectedCabin.name === cabin.name && (
                                  <ListGroup>
                                    {cabin.members.map((member, i) => (
                                      <ListGroup.Item key={i}>
                                        {member.firstName} {member.lastName}
                                      </ListGroup.Item>
                                    ))}
                                  </ListGroup>
                                )}
                              {cabin.isFull && (
                                <span className="text-danger"> - Full</span>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        {!cabinJoined && (
                          <Button
                            className="mt-3"
                            onClick={() => handleJoinCabin()}
                            disabled={
                              !selectedCabin ||
                              cabinList.find(
                                (cabin) => cabin.name === selectedCabin.name
                              ).isFull
                            }
                          >
                            Join Cabin {selectedCabin.name}
                          </Button>
                        )}
                        {cabinJoined && (
                          <div className="mt-3">
                            <p>You have joined Cabin {selectedCabin.name}.</p>
                            <Button variant="secondary" disabled>
                              Joined Cabin {selectedCabin.name}
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>

          <div className="text-center mt-4 mb-5">
            <Button onClick={() => handleSubmit()}>
              Submit Group Selection
            </Button>
          </div>
        </Row>
      </div>
    </div>
  );
};

export default YouthGroupSelection;
