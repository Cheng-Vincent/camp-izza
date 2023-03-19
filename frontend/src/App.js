import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Axios from "axios";
import PrivateRoutes from "./utils/PrivateRoutes";
import Login from "./containers/Login/Login";
import Registration from "./containers/Registration/Registration";
import ParentDashboard from "./containers/ParentDashboard/ParentDashboard";
import Youth_Application from "./containers/Youth_Application/Youth_Application";
import Payment from "./containers/Payment/Payment";
import Parent_Details from "./containers/Parent_Details/Parent_Details";
import Financial_Aid from "./containers/Financial_Aid/Financial_Aid";

function App() {
  Axios.defaults.withCredentials = true;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route element={<PrivateRoutes />}>
            <Route path="parentdashboard" element={<ParentDashboard />} exact />
            <Route path="youth" element={<Youth_Application />} exact />
            <Route path="payment" element={<Payment />} exact />
            <Route path="parentdetails" element={<Parent_Details />} exact />
            <Route path="financial_aid" element={<Financial_Aid />} exact />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="registration" element={<Registration />} />
        </Routes>
      </BrowserRouter>

      <link
        rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css"
        integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4"
        crossorigin="anonymous"
      ></link>

      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Montserrat&family=Poppins:wght@500&display=swap');
      </style>

      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      ></link>

      <script
        src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
        integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
        crossorigin="anonymous"
      ></script>

      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js"
        integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ"
        crossorigin="anonymous"
      ></script>

      <script
        src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"
        integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm"
        crossorigin="anonymous"
      ></script>
    </>
  );
}

export default App;
