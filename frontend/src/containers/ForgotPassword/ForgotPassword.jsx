import React, {useState} from "react";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import yss_logo_blue from "../../assets/yss-logo.png";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const setField = (field, value) => {
        setForm({
            ...form,
            [field]:value
        })
        if (!!errors[field]) {
            setErrors({...errors, [field]:null});
        }
    }

    const findFormErrors = () => {
        const {email} = form;
        const newErrors = {};
        if (!email || email === "") newErrors.email = "Email required"
        else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            newErrors.email = "Please enter a valid email"
        }
        return newErrors;
    }

    const updatePassword = (id, firstName, lastName) => {
        Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + '/updatePassword', {
            email: form.email,
            id: id,
            firstName: firstName, 
            lastName: lastName
        }).then((response) => {
            alert(response.data.message);
            navigate('/login');
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const newErrors = findFormErrors();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + '/checkEmail', {
                email: form.email
            }).then((response) => {
                if (response.data.message) {
                    setErrors({email: "Email not registered under any account"})
                } else {
                    updatePassword(response.data.id, response.data.firstName, response.data.lastName);
                }
            })
        }
    };

    return (
    <>
        <div className="container-lg login-container my-5">
            <Row>
                <Col className="text-center">
                    <a href="/login">
                    <img
                        className="col mb-4 logo"
                        alt="YSS white logo"
                        src={yss_logo_blue}
                    ></img>
                    </a>
                </Col>
                <Col>
                    <Row className="mb-4"><h1>Update Password</h1></Row>
                    <Row>
                        <Form className="forgot-password-form" onSubmit={handleSubmit}>
                            <Row as={Col}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="email"
                                        isInvalid={!!errors.email}
                                        onChange={(e) => {setField('email', e.target.value.trim())}}
                                    ></Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row as={Col}>
                                <Button className="submit-button btn mb-4 mx-auto" type="submit">UPDATE PASSWORD</Button>
                            </Row>
                        </Form>
                    </Row>
                </Col>
            </Row>
        </div>
    </>
    )
}

export default ForgotPassword;