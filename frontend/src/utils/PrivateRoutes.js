import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
    let auth = {'token': false};
    if (localStorage.getItem('token')) {
        auth.token = true;
    }
    return (
        auth.token ? <Outlet/> : <Navigate to='/login'/>
    )
};

export default PrivateRoutes;