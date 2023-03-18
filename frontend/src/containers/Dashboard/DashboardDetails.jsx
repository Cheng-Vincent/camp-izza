import React from "react";
import Navbar from "../Navbar/Navbar";
import Details from "./Details";
import Footer from "../../components/Footer/Footer";

const DashboardDetail = () => {
  return (
    <div>
      <div>Background comes here</div>
      <div class="container  mb-3">
        <div class="details-card-body">
          <h5 class="details-card-title">
            YSS 2023 Theme: Muhammad as the Model
          </h5>
          <p class="details-card-text">
            The 2023 summit is focused on revisiting the relationship that we as
            Muslims have with our beloved Prophet Muhammad (PBUH) as not only a
            teacher, but a role model whose life we can tangibly emulate. What
            can we, as young people in the 21st century, learn from the actions
            of a man who lived in a different region, at a different time, with
            entirely different circumstances? Moreover, what does a model stand
            for, mean, and do? Are our role models just people who we watch and
            listen to, or can we build relationships with them (even if they are
            no longer with us)? Lastly, how can we come to understand Islam in
            the context of the model that Muhammad (PBUH) as being a trajectory
            for what Islam has become today, and what it will become in the
            future?
            <br />
            <br />
            We hope to tackle these and many more questions at YSS 2023,
            surrounded by the wisdom and role models of our community leaders,
            as well as the inspirational minds of our peers.
          </p>
        </div>
      </div>
      <Details />
      <br />
      <div class="row">
            <div class= "col-6">
              <div>Image</div>
            </div>
            <div class = "col-6">
              <div>
              A time for high school Muslim youth to meet new friends, 
              develop a healthy understanding & practice of Islam, ask 
              questions, self-reflect, and engage with community. 
              </div>
            </div>
      </div>
      <br />
      <div class="row">
        <div>Logo Image</div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardDetail;
