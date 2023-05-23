import React, {useState, useEffect} from "react";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import yss_logo_blue from "../../assets/yss-logo.png";
import { useNavigate, useSearchParams } from "react-router-dom";

const SetPassword = () => {
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [queryParams] = useSearchParams()
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

    useEffect(() => {
        // checks if user is logged in
        setField('id', queryParams.get("id"))
      }, []);

    const findFormErrors = () => {
        const {id, password, confirmPassword} = form;
        const newErrors = {};
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

    const newPassword = () => {
        Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + '/setPassword', {
            id: form.id,
            password: form.password
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
            Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + '/checkAccount', {
                id: form.id
            }).then((response) => {
                if (response.data.message) {
                    setErrors({id: "Account does not exist!"})
                } else {
                    newPassword();
                }
            })
        }
    };

    return (
    <>
        <div className="container-lg login-container my-5">
            <Row>
                <Col className="text-center">
                    <a href="https://youthspiritualsummit.weebly.com/">
                    <img
                        className="col mb-4 logo"
                        alt="YSS white logo"
                        src={yss_logo_blue}
                    ></img>
                    </a>
                </Col>
                <Col>
                    <Row className="mb-4"><h1>Set Password</h1></Row>
                    <Row>
                        <Form className="forgot-password-form" onSubmit={handleSubmit}>
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

export default SetPassword;