import React from "react";
import yss_logo_blue from '../../assets/yss-logo.png';
import "./Registration.css";
import RegistrationForm from "./RegistrationForm";

const Registration = () => {
    return (
        <div className="container-lg registration-container my-5">
            <div className="row">
                <div className="col-12 col-md-6 logo-col text-center">
                    <a href="https://youthspiritualsummit.weebly.com/">
                        <img className="col mb-4 logo" alt="YSS white logo" src={yss_logo_blue}></img>
                    </a>
                </div>
                <div className="col-12 col-md-6 registration-col">
                    <RegistrationForm></RegistrationForm>
                </div>
            </div>
        </div>
    );
};

export default Registration;