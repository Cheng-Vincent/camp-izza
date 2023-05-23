import React from "react";
import yss_logo_blue from "../../assets/yss-logo.png";
import LoginForm from "./LoginForm";
import "./Login.css";

const Login = () => {
  return (
    <body>
      <div className="container-lg login-container my-5">
        <div className="row">
          <div className="col-md-6 logo-col text-center">
            <a href="https://youthspiritualsummit.weebly.com/">
              <img
                className="col mb-4 logo"
                alt="YSS white logo"
                src={yss_logo_blue}
              ></img>
            </a>
          </div>
          <div className="col-md-6 login-col">
            <LoginForm></LoginForm>
          </div>
        </div>
      </div>
    </body>
  );
};

export default Login;
