import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";

const LoginForm = () => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [validated, setValidated] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    Axios.defaults.withCredentials = true;

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            login();
        }
        setValidated(true);
    };

    const login = () => {
        Axios.post('/api/login', {
            email: loginEmail,
            password: loginPassword
        }).catch((error) => {
            console.log(error);
        }).then((res) => {
            if (!res.data.auth) {
                setErrorMessage(res.data.message);
                setValidated(false);
            } else {
                console.log(res);
                setErrorMessage("");
                localStorage.setItem("token", res.data.token);
                navigate("/parentdashboard");
            }
        });
    };

    return (
        <>
            <Row className="mb-4 justify-content-center">
                <Col xs={10} md={8} lg={6}>
                    <h1>Login</h1>
                </Col>
            </Row>
            <Row>
                <Col xs={10} md={8} lg={6} className="mx-auto">
                    <Form
                        className="login-form"
                        noValidate
                        validated={validated}
                        onSubmit={handleSubmit}
                    >
                        <Form.Group as={Col} controlId="validationEmailInput" className="mb-4">
                            <Form.Label>Email</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="email"
                                    placeholder="email"
                                    onChange={(e) => {
                                        setLoginEmail(e.target.value);
                                    }}
                                    required
                                ></Form.Control>
                                <Form.Control.Feedback type="invalid">Email required.</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group as={Col} controlId="validationPasswordInput" className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="password"
                                    placeholder="password"
                                    onChange={(e) => {
                                        setLoginPassword(e.target.value);
                                    }}
                                    required
                                ></Form.Control>
                                <Form.Control.Feedback type="invalid">Password required.</Form.Control.Feedback>
                            </InputGroup>
                            <a href="/" className="mb-4">Forgot Password?</a>
                        </Form.Group>
                        <Row><p className="login-error-message">{errorMessage}</p></Row>
                        <Row>
                            <Stack gap={2} className="mx-auto">
                                <Button className="login-button btn-lg mb-4 mx-auto" type="submit">LOG IN</Button>
                                <Button className="register-button btn-lg mb-4 mx-auto" variant="outline-primary"
                                        href="/registration" type="button">NEW HERE? REGISTER</Button>
                            </Stack>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </>
    );
};

export default LoginForm;