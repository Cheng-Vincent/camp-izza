import React, { useState, useEffect } from "react";
import Footer from "../../components/Footer/Footer";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Parent_Details = () => {
  const [validated, setValidate] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [errors, setErrors] = useState({});
  const [parentBirthday, setParentBirthday] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [street, setStreet] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [ec1Name, setec1Name] = useState("");
  const [ec1Phone, setec1Phone] = useState("");
  const [ec1Relation, setec1Relation] = useState("");
  const [ec2Name, setec2Name] = useState("");
  const [ec2Phone, setec2Phone] = useState("");
  const [ec2Relation, setec2Relation] = useState("");
  const [insuranceProvider, setInsurance] = useState("");
  const [insuranceHolder, setInsuranceHolder] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [form, setForm] = useState({});
  const [parentID, setParentID] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // checks if user is logged in
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response) {
        console.log(response);
        if (response.data.loggedIn) {
          setParentID(response.data.user.user_id);
        } else {
          navigate("/login");
        }
      }
    });
  }, []);

  const parentCheck = (info) => {
    let errorsMessage = {};
    if (!info.parentBirthday) {
      errorsMessage.birthday = "Birthday is required.";
    }
    if (!!parentBirthday) {
      var checkBirthday = parentBirthday.split("/");
      console.log(parentBirthday)
      if (checkBirthday.length == 3) {
        const date = new Date(parentBirthday);
        if (!date.getTime()) {
          errorsMessage.birthday = "Enter Valid Birthday";
        }
      }
      else{
        errorsMessage.birthday = "Enter Valid Birthday";
      }
    }
    if (!info.parentPhone) {
      errorsMessage.parentPhone = "Phone Number is required.";
    }
    if (!!info.parentPhone) {
      if (!/^\d+$/.test(info.parentPhone)) {
        errorsMessage.parentPhone = "Enter only numbers.";
      }
      else if(info.parentPhone.length !== 10){
        errorsMessage.parentPhone = "Please enter 10 digit phone number.";
      }
    }
    if (!info.street) {
      errorsMessage.street = "Street Address is required.";
    }
    else{
      if(/^\s*$/.test(info.street)){
        errorsMessage.street = "Street Address is required."
      }
    }

    if (!info.city) {
      errorsMessage.city = "City is required.";
    }
    else{
      if(/^\s*$/.test(info.city)){
        errorsMessage.city = "City is required."
      }
      else if(!/^[a-zA-Z]*$/.test(info.city)){
        errorsMessage.city = "Enter only letters.";
      }
    }

    if (!info.zip) {
      errorsMessage.zip = "Zip Code is required.";
    }
    else{
      if (!/^\d+$/.test(info.zip)) {
        errorsMessage.zip = "Enter only numbers.";
      }
      else if(info.zip.length !== 5){
        errorsMessage.zip = "Please enter 5 digit Zip Code.";
      }
    }
    if (!info.ec1Name) {
      errorsMessage.ec1 = "Emergency Contact name is required.";
    }
    else{
      if(/^\s*$/.test(info.ec1Name)){
        errorsMessage.ec1 = "Emergency Contact name is required."
      }
      else if(!/^[a-zA-Z]*$/.test(info.ec1Name)){
        errorsMessage.ec1 = "Enter only letters.";
      }
    }
    if (!info.ec1Phone) {
      errorsMessage.ec1phone = "Emergency Contact phone number is required.";
    }
    else{
      if (!/^\d+$/.test(info.ec1Phone)) {
        errorsMessage.ec1phone = "Enter only numbers.";
      }
      else if(info.ec1Phone.length !== 10){
        errorsMessage.ec1phone = "Please enter 10 digit phone number.";
      }
    }
    if (!info.ec1Relation) {
      errorsMessage.ec1Relation = "Emergency Contact Relation is required.";
    }
    else{
      if(/^\s*$/.test(info.ec1Relation)){
        errorsMessage.ec1Relation = "Emergency Contact Relation is required."
      }
      else if(!/^[a-zA-Z]*$/.test(info.ec1Relation)){
        errorsMessage.ec1Relation = "Enter only letters.";
      }
    }

    if (!info.ec2Name) {
      errorsMessage.ec2 = "Emergency Contact name is required.";
    }
    else{
      if(/^\s*$/.test(info.ec2Name)){
        errorsMessage.ec2 = "Emergency Contact name is required."
      }
      else if(!/^[a-zA-Z]*$/.test(info.ec2Name)){
        errorsMessage.ec2 = "Enter only letters.";
      }
    }
    if (!info.ec2Phone) {
      errorsMessage.ec2phone = "Emergency Contact phone number is required.";
    }
    else{
      if (!/^\d+$/.test(info.ec2Phone)) {
        errorsMessage.ec2phone = "Enter only numbers.";
      }
      else if(info.ec2Phone.length !== 10){
        errorsMessage.ec2phone = "Please enter digit phone number.";
      }
    }
    if (!info.ec2Relation) {
      errorsMessage.ec2Relation = "Emergency Contact Relation is required.";
    }
    else{
      if(/^\s*$/.test(info.ec2Relation)){
        errorsMessage.ec2Relation = "Emergency Contact Relation is required."
      }
      else if(!/^[a-zA-Z]*$/.test(info.ec2Relation)){
        errorsMessage.ec2Relation = "Enter only letters.";
      }
    }

    if (!info.insuranceProvider) {
      errorsMessage.insuranceProvider = "Insurance Provider is required.";
    }
    else{
      if(/^\s*$/.test(info.insuranceProvider)){
        errorsMessage.insuranceProvider = "Insurance Provider is required."
      }
    }

    if (!info.insuranceHolder) {
      errorsMessage.insuranceHolder = "Insurance Holder is required.";
    }
    else{
      if(/^\s*$/.test(info.insuranceHolder)){
        errorsMessage.insuranceHolder = "Insurance Holder is required."
      }
    }

    if (!info.insuranceNumber) {
      errorsMessage.insuranceNumber = "Isurance Number is required.";
    }
    else{
      if(/^\s*$/.test(info.insuranceNumber)){
        errorsMessage.insuranceNumber = "Insurance Number is required.";
      }
    }

    return errorsMessage;
  };

  const saveInfo = (e) => {
    e.preventDefault();
    const info = {
      parentBirthday: parentBirthday,
      parentPhone: parentPhone,
      street: street,
      city: city,
      zip: zip,
      ec1Name: ec1Name,
      ec1Phone: ec1Phone,
      ec1Relation: ec1Relation,
      ec2Name: ec2Name,
      ec2Phone: ec2Phone,
      ec2Relation: ec2Relation,
      insuranceProvider: insuranceProvider,
      insuranceHolder: insuranceHolder,
      insuranceNumber: insuranceNumber,
    };
    const newErrors = parentCheck(info);
    console.log(newErrors)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      e.preventDefault();
      Axios.post("http://localhost:3001/parentDetails", {
        parentID: parentID,
        parentBirthday: parentBirthday,
        parentPhone: parentPhone,
        street: street,
        city: city,
        zip: zip,
        ec1Name: ec1Name,
        ec1Phone: ec1Phone,
        ec1Relation: ec1Relation,
        ec2Name: ec2Name,
        ec2Phone: ec2Phone,
        ec2Relation: ec2Relation,
        insuranceProvider: insuranceProvider,
        insuranceHolder: insuranceHolder,
        insuranceNumber: insuranceNumber,
      }).then(() => {
        alert("Form submitted!");
        navigate("/parentdashboard");
      });
    }
  };

  return (
    <>
      <section className="application-section"></section>
      <div className="container registration-container">
        <Form noValidate validated={validated} onSubmit={saveInfo}>
          <Row className="mb-3">
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupBirthday">
                <Form.Label>Date of Birth (MM/DD/YY)</Form.Label>
                <Form.Control
                  required
                  type="birthday"
                  placeholder="Enter Birthday"
                  onChange={(e) => {
                    setParentBirthday(e.target.value);
                    if (!!errors.birthday)
                      setErrors({
                        ...errors,
                        birthday: null,
                      });
                  }}
                  isInvalid={!!errors.birthday}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.birthday}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupPhoneNumber">
                <Form.Label>Parent/Guardian Phone Number</Form.Label>
                <Form.Control
                  type="phonenumber"
                  placeholder="Enter Phone Number"
                  onChange={(e) => {
                    setParentPhone(e.target.value);
                    if (!!errors.parentPhone)
                      setErrors({
                        ...errors,
                        parentPhone: null,
                      });
                  }}
                  isInvalid={!!errors.parentPhone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.parentPhone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Form.Group className="mb-3" controlId="formGroupAddress">
              <Form.Label>Street Address</Form.Label>
              <Form.Control
                required
                type="name"
                placeholder="Enter Street Address"
                onChange={(e) => {
                  setStreet(e.target.value.trim());
                  if (!!errors.street)
                    setErrors({
                      ...errors,
                      street: null,
                    });
                }}
                isInvalid={!!errors.street}
              />
              <Form.Control.Feedback type="invalid">
                {errors.street}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupCity">
                <Form.Label>City</Form.Label>
                <Form.Control
                  required
                  type="city"
                  placeholder="Enter City"
                  onChange={(e) => {
                    setCity(e.target.value.trim());
                    if (!!errors.city)
                      setErrors({
                        ...errors,
                        city: null,
                      });
                  }}
                  isInvalid={!!errors.city}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.city}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupZip">
                <Form.Label>Zip Code</Form.Label>
                <Form.Control
                  required
                  type="zip"
                  placeholder="Enter Address Zip Code"
                  onChange={(e) => {
                    setZip(e.target.value.trim());
                    if (!!errors.zip)
                      setErrors({
                        ...errors,
                        zip: null,
                      });
                  }}
                  isInvalid={!!errors.zip}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.zip}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupEC1">
                <Form.Label>Emergency Contact #1 Name</Form.Label>
                <Form.Control
                  required
                  type="ec1"
                  placeholder="Enter Name"
                  onChange={(e) => {
                    setec1Name(e.target.value.trim());
                    if (!!errors.ec1)
                      setErrors({
                        ...errors,
                        ec1: null,
                      });
                  }}
                  isInvalid={!!errors.ec1}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ec1}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupEC1Phone">
                <Form.Label>Emergency Contact #1 Phone Number</Form.Label>
                <Form.Control
                  required
                  type="ec1Phone"
                  placeholder="Enter Phone Number"
                  onChange={(e) => {
                    setec1Phone(e.target.value.trim());
                    if (!!errors.ec1phone)
                      setErrors({
                        ...errors,
                        ec1phone: null,
                      });
                  }}
                  isInvalid={!!errors.ec1phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ec1phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupEC1Relation">
                <Form.Label>Emergency Contact #1 Relation</Form.Label>
                <Form.Control
                  required
                  type="ec1Relation"
                  placeholder="Relation to Youth"
                  onChange={(e) => {
                    setec1Relation(e.target.value.trim());
                    if (!!errors.ec1Relation)
                      setErrors({
                        ...errors,
                        ec1Relation: null,
                      });
                  }}
                  isInvalid={!!errors.ec1Relation}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ec1Relation}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupEC2">
                <Form.Label>Emergency Contact #2 Name</Form.Label>
                <Form.Control
                  required
                  type="ec2"
                  placeholder="Enter Name"
                  onChange={(e) => {
                    setec2Name(e.target.value.trim());
                    if (!!errors.ec2)
                      setErrors({
                        ...errors,
                        ec2: null,
                      });
                  }}
                  isInvalid={!!errors.ec2}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ec2}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupEC2Phone">
                <Form.Label>Emergency Contact #2 Phone Number</Form.Label>
                <Form.Control
                  required
                  type="ec2Phone"
                  placeholder="Enter Phone Number"
                  onChange={(e) => {
                    setec2Phone(e.target.value.trim());
                    if (!!errors.ec2phone)
                      setErrors({
                        ...errors,
                        ec2phone: null,
                      });
                  }}
                  isInvalid={!!errors.ec2phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ec2phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupEC2Relation">
                <Form.Label>Emergency Contact #2 Relation</Form.Label>
                <Form.Control
                  required
                  type="ec2Relation"
                  placeholder="Relation to Youth"
                  onChange={(e) => {
                    setec2Relation(e.target.value.trim());
                    if (!!errors.ec2Relation)
                      setErrors({
                        ...errors,
                        ec2Relation: null,
                      });
                  }}
                  isInvalid={!!errors.ec2Relation}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ec2Relation}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col className="mb-3">
              <Form.Group
                className="mb-3"
                controlId="formGroupInsuranceProvider"
              >
                <Form.Label>Insurance Provider</Form.Label>
                <Form.Control
                  required
                  type="insuranceprovider"
                  placeholder="Enter Insurance Provider"
                  onChange={(e) => {
                    setInsurance(e.target.value.trim());
                    if (!!errors.insuranceProvider)
                      setErrors({
                        ...errors,
                        insuranceProvider: null,
                      });
                  }}
                  isInvalid={!!errors.insuranceProvider}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.insuranceProvider}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupInsuranceNumber">
                <Form.Label>Insurance Policy Number</Form.Label>
                <Form.Control
                  required
                  type="insurancenumber"
                  placeholder="Enter Policy Number"
                  onChange={(e) => {
                    setInsuranceNumber(e.target.value.trim());
                    if (!!errors.insuranceNumber)
                      setErrors({
                        ...errors,
                        insuranceNumber: null,
                      });
                  }}
                  isInvalid={!!errors.insuranceNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.insuranceNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className="mb-3">
              <Form.Group className="mb-3" controlId="formGroupInsuranceHolder">
                <Form.Label>Insurance Holder</Form.Label>
                <Form.Control
                  required
                  type="insuranceHolder"
                  placeholder="Enter Insurance Holder"
                  onChange={(e) => {
                    setInsuranceHolder(e.target.value.trim());
                    if (!!errors.insuranceHolder)
                      setErrors({
                        ...errors,
                        insuranceHolder: null,
                      });
                  }}
                  isInvalid={!!errors.insuranceHolder}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.insuranceHolder}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Stack gap={2} className="mx-auto">
              <Button className="mb-3 mx-auto btn-md" variant="primary" type="submit" onClick={() => setShowMessage(false)}>Submit</Button>
              <Button className="mb-4 mx-auto btn-md" variant="outline-primary" href="/parentdashboard">BACK</Button>
            </Stack>
          </Row>
        </Form>
      </div>
      <Footer />
    </>
  );
};

export default Parent_Details;
