import React, {useState} from "react";
import Axios from "axios";
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
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
        const {firstName, lastName, email, password, confirmPassword} = form;
        const newErrors = {};
        if (!firstName || firstName === "") newErrors.firstName = "First name required"
        if (!lastName || lastName === "") newErrors.lastName = "Last name required"
        if (!email || email === "") newErrors.email = "Email required"
        else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            newErrors.email = "Please enter a valid email"
        }
        if (!password || password === '') newErrors.password = "Please choose a password"
        else if (confirmPassword && !(confirmPassword === password)) { 
            newErrors.confirmPassword = "Passwords do not match";
            newErrors.password = "Passwords do not match";
        }
        else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(password)) {
            newErrors.password = "Password must be 8-15 characters long and contain at least one lowercase letter, "
                                + "one uppercase letter, one digit, and one special character";
            newErrors.confirmPassword = "Please confirm your password"
        }
        if (!confirmPassword || confirmPassword === '') newErrors.confirmPassword = "Please confirm your password"
        return newErrors;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const newErrors = findFormErrors();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            Axios.post('api/checkEmail', {
                email: form.email
            }).then((response) => {
                console.log(response);
                if (!response.data.message) {
                    setErrors({email: 'An account with this email already exists'});
                } else {
                    register();
                }
            })
        }
    }

    const register = () => {
        Axios.post('api/register', {
            email: form.email,
            password: form.password,
            first_name: form.firstName,
            last_name: form.lastName,
            account_type: "parent"
        }).then((response) => { 
            setMessage('');
            sendConfirmEmail();
            alert(response.data.message);
            navigate('/login');
        });
    };

    const sendConfirmEmail = () => {
        Axios.post('api/sendConfirmEmail', {
            email: form.email,
            name: form.firstName +' '+ form.lastName,
            account_type: "parent"
        }).then((response) => {
            console.log(response)
        })
    }

    return (
        <>
            <Row>
                <Col className="mb-4"><h1>Register a new account.</h1></Col>
            </Row>
            <Row>
                <Col className="mb-4">
                    <Form class="registration-form" onSubmit={handleSubmit}>
                        <Row as={Col} className="mb-4">
                            <label class="mr-4">What are you registering as? <br/>
                                (If you are a youth participant, a parent/guardian must do this part)
                            </label>
                            <div key={'inline-radio'}>
                                <Form.Check
                                required
                                inline
                                name="accountType"
                                label="Parent/Guardian"
                                type="radio"
                                ></Form.Check>
                                <Form.Check
                                inline
                                disabled
                                name="accountType"
                                label="Counselor"
                                type="radio"></Form.Check>
                            </div>
                        </Row>
                        <Row as={Col}>
                            <Form.Group as={Col} md={6} className="mb-4">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                type="text"
                                placeholder="first name"
                                isInvalid={!!errors.firstName}
                                onChange={(e) => {setField('firstName', e.target.value.trim())}}></Form.Control>
                                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-4">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                type="text"
                                placeholder="last name"
                                isInvalid={!!errors.lastName}
                                onChange={(e) => {setField('lastName', e.target.value.trim())}}></Form.Control>
                                <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
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
                            <Form.Group className="mb-4">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="password"
                                    isInvalid={!!errors.password}
                                    onChange={(e) => {setField('password', e.target.value)}}
                                ></Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row as={Col}>
                            <Form.Group className="mb-4">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="confirm password"
                                    isInvalid={!!errors.confirmPassword}
                                    onChange={(e) => {setField('confirmPassword', e.target.value)}}
                                ></Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.confirmPassword}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row><p class="error-msg">{message}</p></Row>
                        <Row>
                            <Stack gap={2} className="mx-auto">
                                <Button className="registration-button btn-lg mb-4 mx-auto" type="submit">REGISTER</Button>
                                <Button className="returning-button btn-lg mb-4 mx-auto" variant="outline-primary" href="/login" type="button">RETURNING USER? LOGIN</Button>
                            </Stack>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </>
    );
};

export default RegistrationForm;