import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Axios from "axios";
import PrivateRoutes from "./utils/PrivateRoutes";
import Login from "./containers/Login/Login";
import Registration from "./containers/Registration/Registration";
import ForgotPassword from "./containers/ForgotPassword/ForgotPassword";
import SetPassword from "./containers/SetPassword/SetPassword";
import ParentDashboard from "./containers/ParentDashboard/ParentDashboard";
import ParentYouthApplication from "./containers/ParentDashboard/ParentYouthApplication";
import Payment from "./containers/ParentDashboard/Payment";
import ParentDetailsForm from "./containers/ParentDashboard/ParentDetailsForm";
import ParentFinancialAid from "./containers/ParentDashboard/ParentFinancialAid";
import YouthDashboard from "./containers/YouthDashboard/YouthDashboard";
import YouthGroupSelection from "./containers/YouthDashboard/YouthGroupSelection";
import AdminManageGroup from "./containers/AdminDashboard/AdminManageGroups";
import AdminDashboard from "./containers/AdminDashboard/AdminDashboard";
import AdminProgramInfo from "./containers/AdminDashboard/AdminProgramInfo";
import AdminRoster from "./containers/AdminDashboard/AdminRoster";
import AdminFinancialAid from "./containers/AdminDashboard/AdminFinancialAid";
import AdminParents from "./containers/AdminDashboard/AdminParents";
import AdminYouth from "./containers/AdminDashboard/AdminYouth";
import AdminCounselors from "./containers/AdminDashboard/AdminCounselors";

function App() {
  Axios.defaults.withCredentials = true;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route element={<PrivateRoutes account_type="youth" />}>
            <Route path="youth" element={<YouthDashboard />} />
            <Route
              path="youth/groupselection"
              element={<YouthGroupSelection />}
              exact
            />
          </Route>
          <Route element={<PrivateRoutes account_type="parent" />}>
            <Route path="parent/payment" element={<Payment />} exact />
            <Route
              path="parent/financialaid"
              element={<ParentFinancialAid />}
              exact
            />
            <Route path="parent" element={<ParentDashboard />} exact />
            <Route
              path="parent/youthapplication"
              element={<ParentYouthApplication />}
              exact
            />
            <Route
              path="parent/detailsform"
              element={<ParentDetailsForm />}
              exact
            />
          </Route>
          <Route element={<PrivateRoutes account_type="admin" />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/program" element={<AdminProgramInfo />} />
            <Route path="admin/roster" element={<AdminRoster />} />
            <Route path="admin/parents" element={<AdminParents />} />
            <Route path="admin/financialaid" element={<AdminFinancialAid />} />
            <Route path="admin/counselors" element={<AdminCounselors />} />
            <Route
              path="admin/managegroup"
              element={<AdminManageGroup />}
              exact
            />
            <Route path="admin/youth" element={<AdminYouth />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="registration" element={<Registration />} />
          <Route path="forgotpassword" element={<ForgotPassword />} />
          <Route path="setpassword" element={<SetPassword />} />
        </Routes>
      </BrowserRouter>

      <link
        rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css"
        integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4"
        crossOrigin="anonymous"
      ></link>

      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      ></link>

      <script
        src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
        integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
        crossOrigin="anonymous"
      ></script>

      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js"
        integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ"
        crossOrigin="anonymous"
      ></script>

      <script
        src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"
        integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm"
        crossOrigin="anonymous"
      ></script>
    </>
  );
}

export default App;
