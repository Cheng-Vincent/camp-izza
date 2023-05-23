import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import "./YouthDashboard.css";
import YouthDashboardContents from "./YouthDashboardContents";

const YouthDashboard = () => {
  const [isLoading, setLoading] = useState(true);
  const [youthID, setYouthID] = useState("");
  const [youthInfo, setYouthInfo] = useState({});
  const [youthGroups, setYouthGroups] = useState({});
  const [roster, setRoster] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // checks if user is logged in
    Axios.get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/login").then(
      (response) => {
        if (response.data.loggedIn) {
          if (response.data.user.account_type === "youth")
            setYouthID(response.data.user.user_id);
          else {
            navigate(`/${response.data.user.account_type}`);
          }
        } else {
          navigate("/login");
        }
      }
    );
  }, []);

  useEffect(() => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/youthdashboard", {
      youth_id: youthID,
    }).then((response) => {
      setYouthInfo(response.data.youth_info);
      setYouthGroups(response.data.youth_groups);
      getRosters(response.data.youth_groups);
    });
  }, [youthID]);

  const getRosters = (group_info) => {
    Axios.post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/groupRosters", {
      bus_id: group_info.b_id,
      family_id: group_info.f_id,
      cabin_id: group_info.c_id,
    }).then((response) => {
      setRoster(response.data);
      setLoading(false);
    });
  };

  return (
    <>
      <YouthDashboardContents
        isLoading={isLoading}
        youthInfo={youthInfo}
        youthGroups={youthGroups}
        roster={roster}
      />
    </>
  );
};

export default YouthDashboard;
