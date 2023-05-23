import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";
import LoadingPage from "../../components/LoadingPage/LoadingPage";

const AdminProgramInfo = () => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showSelectedEvent, setShowSelectedEvent] = useState(false);
  const [showCreatePrice, setShowCreatePrice] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [eventForm, setEventForm] = useState({});
  const [priceForm, setPriceForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [events, setEvents] = useState([]);
  const [prices, setPrices] = useState([]);
  const [families, setFamilies] = useState([]);
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(
    new Date(now.getFullYear(), 8, 1)
  );

  useEffect(() => {
    Axios.get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/programInfo").then(
      (response) => {
        if (response.data) {
          setEvents(response.data.events);
          setPrices(response.data.prices);
          setFamilies(response.data.families);
        }
      }
    );
  }, []);

  const formatTimeString = (time, period) => {
    return time
      ? period === "PM"
        ? `${(parseInt(time.slice(0, 2)) - 12)
            .toString()
            .padStart(2, "0")}${time.slice(2, 5)}`
        : time.slice(0, 5)
      : "";
  };

  const setField = (formType, field, value) => {
    switch (formType) {
      case "event":
        setEventForm({
          ...eventForm,
          [field]: value,
        });
        break;
      case "price":
        setPriceForm({
          ...priceForm,
          [field]: value,
        });
        break;
    }
    if (!!formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const findEventFormErrors = () => {
    const {
      eventName,
      startHour,
      startMinute,
      startPeriod,
      endHour,
      endMinute,
      endPeriod,
      location,
    } = eventForm;
    const newErrors = {};
    if (!eventName) newErrors.eventName = "Event name required";
    if (!location) newErrors.location = "Location required";
    if (!startHour || parseInt(startHour) === NaN)
      newErrors.startHour = "Hour required";
    if (!startMinute || parseInt(startMinute) === NaN)
      newErrors.startMinute = "Minute required";
    if (!endHour || parseInt(endHour) === NaN)
      newErrors.endHour = "Hour required";
    if (!endMinute || parseInt(endMinute) === NaN)
      newErrors.endMinute = "Minute required";
    if (!startPeriod) newErrors.startPeriod = "Required";
    if (!endPeriod) newErrors.endPeriod = "Required";
    if (
      startPeriod &&
      endPeriod &&
      startPeriod.toLowerCase() === "pm" &&
      endPeriod.toLowerCase() === "am" &&
      parseInt(startHour) != 12
    ) {
      newErrors.startPeriod = "Start time cannot be after end time";
      newErrors.endPeriod = "Start time cannot be after end time";
    }
    if (
      startPeriod === endPeriod &&
      parseInt(startHour) > parseInt(endHour) &&
      startHour != 12
    ) {
      newErrors.startHour = "Invalid times";
      newErrors.endHour = "Invalid times";
    }
    if (
      startPeriod === endPeriod &&
      parseInt(startHour) < parseInt(endHour) &&
      parseInt(endHour) === 12
    ) {
      newErrors.startHour = "Invalid times";
      newErrors.endHour = "Invalid times";
    }
    if (
      startPeriod === endPeriod &&
      parseInt(startHour) === parseInt(endHour) &&
      parseInt(startMinute) >= parseInt(endMinute)
    ) {
      newErrors.startMinute = "Invalid times";
      newErrors.endMinute = "Invalid times";
    }
    return newErrors;
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const newErrors = findEventFormErrors();
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
    } else {
      let selectedFamilies = []; // ids of selected families
      if (eventForm["checkAll"] != null && eventForm["checkAll"]) {
        families.map((family) => {
          selectedFamilies.push(family.id);
        });
      } else {
        for (const field in eventForm) {
          if (/family\d/.test(field) && eventForm[field]) {
            selectedFamilies.push(field[field.length - 1]);
          }
        }
      }
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/createEvent", {
        eventName: eventForm.eventName,
        date: selectedDate,
        startTime: `${
          eventForm.startPeriod === "PM"
            ? `${parseInt(eventForm.startHour) + 12}`
            : eventForm.startHour
        }:${eventForm.startMinute.padStart(2, "0")}`,
        startPeriod: eventForm.startPeriod,
        endTime: `${
          eventForm.startPeriod === "PM"
            ? `${parseInt(eventForm.endHour) + 12}`
            : eventForm.endHour
        }:${eventForm.endMinute.padStart(2, "0")}`,
        endPeriod: eventForm.endPeriod,
        location: eventForm.location,
        assigned_families: selectedFamilies,
      }).then((response) => {
        alert(response.data.message);
        setShowCreateEvent(false);
        window.location.reload(false);
      });
    }
  };

  const handleCreatePrice = (e) => {
    console.log("finding errors");
    e.preventDefault();
    // find errors
    const { type, price } = priceForm;
    const newErrors = {};
    if (!type) newErrors.type = "Type required";
    if (!price) newErrors.price = "Price required";
    else if (!/^\d*\.?\d*$/.test(price)) newErrors.price = "Invalid price";
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
    } else {
      Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/createPrice", {
        type: priceForm.type,
        price: priceForm.price,
      }).then((response) => {
        alert(response.data.message);
        setShowCreatePrice(false);
        window.location.reload(false);
      });
    }
  };

  const handleViewEvent = (id) => {
    for (let i = 0; i < events.length; i++) {
      if (events[i].event_id === parseInt(id)) {
        setSelectedEvent(events[i]);
        setShowSelectedEvent(true);
        break;
      }
    }
  };

  const handleDeleteEvent = () => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/deleteEvent", {
      eventID: selectedEvent.event_id,
    }).then((response) => {
      alert(response.data.message);
      setShowSelectedEvent(false);
      setSelectedEvent({});
      window.location.reload(false);
    });
  };

  const handleDeletePrice = (id) => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/deletePrice", {
      priceID: id,
    }).then((response) => {
      alert(response.data.message);
      window.location.reload(false);
    });
  };

  const handleActivatePrice = (id) => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/activatePrice", {
      priceID: id,
    }).then((response) => {
      alert(response.data.message);
      window.location.reload(false);
    });
  };

  return events && prices && families ? (
    <div class="body pb-5">
      <Row className="mt-3">
        <HeaderLogo href="/admin" />
      </Row>
      <div className="admin-container mx-auto py-3 mb-5">
        <Row className="mx-auto mt-3">
          <Col className="text-left">
            <CustomButton text="Back" href="/admin" />
          </Col>
        </Row>
        <Row className="text-center mx-auto mb-4">
          <Col>
            <h1 style={{ fontSize: "1.7rem", color: "#e2e4ee" }}>
              Program Info
            </h1>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col className="text-center">
            <h1 style={{ fontSize: "1.3rem", color: "#e2e4ee" }}>Prices</h1>
          </Col>
        </Row>
        <Row className="text-center mx-auto mb-4">
          <Col>
            <div
              style={{
                width: "30rem",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <Table
                size="sm"
                variant="light"
                hover
                responsive
                bordered
                striped
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Active</th>
                    <th>Set Active</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price, i) => (
                    <tr>
                      <td>{i + 1}</td>
                      <td>{price.type}</td>
                      <td>{price.price}</td>
                      <td>{price.active ? "X" : ""}</td>
                      <td>
                        <Button
                          disabled={price.active}
                          id={`activate-${price.price_id}`}
                          onClick={(e) => {
                            handleActivatePrice(e.target.id.split("-")[1]);
                          }}
                        >
                          Activate
                        </Button>
                      </td>
                      <td>
                        <Button
                          id={`delete-${price.price_id}`}
                          disabled={price.active}
                          variant="danger"
                          onClick={(e) => {
                            handleDeletePrice(e.target.id.split("-")[1]);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td></td>
                    <td>
                      <Container
                        as={Button}
                        variant="success"
                        style={{ "border-radius": "15px", width: "5rem" }}
                        onClick={() => {
                          setShowCreatePrice(true);
                        }}
                      >
                        <h2
                          className="my-1 mx-auto"
                          style={{ "font-size": "0.9rem" }}
                        >
                          + price
                        </h2>
                      </Container>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col className="text-center">
            <h1 style={{ fontSize: "1.3rem", color: "#e2e4ee" }}>Schedule</h1>
          </Col>
        </Row>
        <Row className="mb-5 d-flex">
          <Col className="d-flex justify-content-end">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              activeStartDate={new Date(now.getFullYear(), 8, 1)}
              minDate={new Date(now.getFullYear(), 8, 1)}
              maxDate={new Date(now.getFullYear(), 8, 30)}
            ></Calendar>
          </Col>
          <Col className="calendar-info d-flex justify-content-start" md={8}>
            <Container
              class="calendar-info"
              className="p-4"
              style={{
                border: "1px solid #a0a096",
                "border-radius": "10px",
                backgroundColor: "white",
              }}
            >
              <Row className="mb-2">
                <h2 style={{ "font-size": "1.2rem" }}>
                  {selectedDate.toDateString()}
                </h2>
              </Row>
              <Row className="mb-1">
                <Col>
                  {events.map((event) => {
                    if (
                      event.date.slice(0, 10) ===
                      `${selectedDate.getFullYear()}-${(
                        selectedDate.getMonth() + 1
                      )
                        .toString()
                        .padStart(2, "0")}-${selectedDate
                        .getDate()
                        .toString()
                        .padStart(2, "0")}`
                    ) {
                      return (
                        <Row>
                          <Col sm={10} className="justify-content-end">
                            <Container
                              as={Button}
                              className="mb-2"
                              variant="dark"
                              style={{
                                "border-radius": "15px",
                                width: "100%",
                              }}
                              disabled
                            >
                              <Row>
                                <Col>
                                  <h2
                                    className="my-1 mx-auto text-left"
                                    style={{ "font-size": "0.9rem" }}
                                  >
                                    {event.name} @ {event.location}
                                  </h2>
                                </Col>
                                <Col>
                                  <h2
                                    className="my-1 mx-auto text-right"
                                    style={{ "font-size": "0.9rem" }}
                                  >
                                    {formatTimeString(
                                      event.start_time,
                                      event.start_period
                                    )}
                                    {event.start_period}-
                                    {formatTimeString(
                                      event.end_time,
                                      event.end_period
                                    )}
                                    {event.end_period}
                                  </h2>
                                </Col>
                              </Row>
                            </Container>
                          </Col>
                          <Col sm={1} className="justify-content-end">
                            <Container
                              as={Button}
                              className="mb-2"
                              variant="dark"
                              style={{
                                "border-radius": "15px",
                                width: "4rem",
                              }}
                              id={event.event_id}
                              onClick={(e) => {
                                handleViewEvent(e.target.id);
                              }}
                            >
                              View
                            </Container>
                          </Col>
                        </Row>
                      );
                    }
                  })}
                </Col>
              </Row>
              <Row className="mt-3 mb-3">
                <Col>
                  <Container
                    as={Button}
                    variant="success"
                    style={{ "border-radius": "15px", width: "8.5rem" }}
                    onClick={() => {
                      setShowCreateEvent(true);
                    }}
                  >
                    <h2
                      className="my-1 mx-auto"
                      style={{ "font-size": "0.9rem" }}
                    >
                      + Create Event
                    </h2>
                  </Container>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </div>

      <Modal
        className="create-event-modal"
        show={showCreateEvent}
        onHide={() => {
          setShowCreateEvent(false);
        }}
        backdrop="static"
        keyboard={false}
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Create Event on {selectedDate.toDateString()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form>
            <Row className="mb-3">
              <Form.Group>
                <Form.Label>Event Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Event name"
                  isInvalid={!!formErrors.eventName}
                  onChange={(e) => {
                    setField("event", "eventName", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.eventName}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-2">
              <Col>Start Time</Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Select
                      isInvalid={!!formErrors.startHour}
                      onChange={(e) => {
                        setField("event", "startHour", e.target.value);
                      }}
                    >
                      <option value="hh">hh</option>
                      {[
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                        "11",
                        "12",
                      ].map((h, i) => (
                        <option value={h}>{h}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.startHour}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Select
                      isInvalid={!!formErrors.startMinute}
                      onChange={(e) => {
                        setField("event", "startMinute", e.target.value);
                      }}
                    >
                      <option value="mm">mm</option>
                      {[
                        "0",
                        "5",
                        "10",
                        "15",
                        "20",
                        "25",
                        "30",
                        "35",
                        "40",
                        "45",
                        "50",
                        "55",
                      ].map((m) => (
                        <option value={m}>{m.padStart(2, "0")}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.startMinute}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Select
                      isInvalid={!!formErrors.startPeriod}
                      onChange={(e) => {
                        setField("event", "startPeriod", e.target.value);
                      }}
                    >
                      <option></option>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.startPeriod}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>End Time</Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Select
                      isInvalid={!!formErrors.endHour}
                      onChange={(e) => {
                        setField("event", "endHour", e.target.value);
                      }}
                    >
                      <option value="hh">hh</option>
                      {[
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                        "11",
                        "12",
                      ].map((h, i) => (
                        <option value={h.padStart(2, "0")}>{h}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.endHour}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Select
                      isInvalid={!!formErrors.endMinute}
                      onChange={(e) => {
                        setField("event", "endMinute", e.target.value);
                      }}
                    >
                      <option value="mm">mm</option>
                      {[
                        "00",
                        "05",
                        "10",
                        "15",
                        "20",
                        "25",
                        "30",
                        "35",
                        "40",
                        "45",
                        "50",
                        "55",
                      ].map((m) => (
                        <option value={m}>{m}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.endMinute}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Select
                      isInvalid={!!formErrors.endPeriod}
                      onChange={(e) => {
                        setField("event", "endPeriod", e.target.value);
                      }}
                    >
                      <option></option>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.endPeriod}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
              </Col>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Location"
                  isInvalid={!!formErrors.location}
                  onChange={(e) => {
                    setField("event", "location", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.location}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Label>Assign To Families</Form.Label>
              <Col>
                <Row className="mx-3">
                  <Col className="mr-4">
                    <Form.Check
                      label="All"
                      type="switch"
                      id="check-all"
                      onChange={() => {
                        if (
                          eventForm["checkAll"] == null ||
                          !eventForm["checkAll"]
                        ) {
                          setField("event", "checkAll", true);
                        } else {
                          setField("event", "checkAll", false);
                        }
                      }}
                    ></Form.Check>
                  </Col>
                  {families.map((family) => (
                    <Col className="mr-4">
                      <Form.Check
                        label={family.name}
                        type="switch"
                        id={"check-" + family.id}
                        onChange={() => {
                          if (
                            eventForm[`family${family.id}`] == null ||
                            !eventForm[`family${family.id}`]
                          ) {
                            setField("event", `family${family.id}`, true);
                          } else {
                            setField("event", `family${family.id}`, false);
                          }
                        }}
                      ></Form.Check>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Form>
          <Modal.Footer>
            <Button onClick={handleCreateEvent}>Save</Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
      <Modal
        className="selected-event-modal"
        show={showSelectedEvent && selectedEvent}
        onHide={() => {
          setShowSelectedEvent(false);
        }}
        backdrop="static"
        keyboard={false}
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent ? selectedEvent.name : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col>Date: {selectedEvent ? selectedDate.toDateString() : ""}</Col>
          </Row>
          <Row className="mb-3">
            <Col>
              Start Time:{" "}
              {selectedEvent ? (
                formatTimeString(
                  selectedEvent.start_time,
                  selectedEvent.start_period
                )
              ) : (
                <></>
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              End Time:{" "}
              {selectedEvent ? (
                formatTimeString(
                  selectedEvent.end_time,
                  selectedEvent.end_period
                )
              ) : (
                <></>
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>Location: {selectedEvent ? selectedEvent.location : ""}</Col>
          </Row>
          <Modal.Footer>
            <Button
              variant="danger"
              disabled={!selectedEvent}
              onClick={handleDeleteEvent}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>

      <Modal
        className="create-price-modal"
        show={showCreatePrice}
        onHide={() => {
          setShowCreatePrice(false);
        }}
        backdrop="static"
        keyboard={false}
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Type</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Price type"
                  isInvalid={!!formErrors.type}
                  onChange={(e) => {
                    setField("price", "type", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.type}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Price</Form.Label>
                <Form.Control
                  placeholder="Price"
                  isInvalid={!!formErrors.price}
                  onChange={(e) => {
                    setField("price", "price", e.target.value.trim());
                  }}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
          </Form>
          <Modal.Footer>
            <Button onClick={handleCreatePrice}>Save</Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </div>
  ) : (
    <LoadingPage />
  );
};

export default AdminProgramInfo;
