import React from "react";
import yss_logo_blue from '../../assets/yss-logo.png';
import LoginForm from "./LoginForm"
import "./Login.css";

const Login = () => {
    return (
        <>
            <div class="container-lg login-container my-5">
                <div class="row">
                    <div class="col logo-col">
                        <a href="https://youthspiritualsummit.weebly.com/">
                            <img class="col mb-4 logo" alt="YSS white logo" src={yss_logo_blue}></img>
                        </a>
                    </div>
                    <div class="col-6 login-col">
                        <LoginForm></LoginForm>
                    </div>
                </div>
            </div>
        </>
    );
};



export default Login;