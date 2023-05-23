import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = ({ account_type }) => {
  let auth = { token: false };
  if (
    localStorage.getItem("token") &&
    localStorage.getItem("account_type") === account_type
  ) {
    auth.token = true;
  }
  return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
