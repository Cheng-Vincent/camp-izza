import React, {useState} from "react";
import yss_logo_blue from '../../assets/yss-logo.png';
import "./Registration.css";
import RegistrationForm from "./RegistrationForm";

const Registration = () => {
    return (
            <div class="container-lg registration-container my-5">
                <div class="row">
                    <div class="col logo-col">
                        <a href="https://youthspiritualsummit.weebly.com/">
                            <img class="col mb-4 logo" alt="YSS white logo" src={yss_logo_blue}></img>
                        </a>
                    </div>
                    <div class="col-6 registration-col">
                        <RegistrationForm></RegistrationForm>
                    </div>               
                </div>
                
            </div>
    );
};





export default Registration;