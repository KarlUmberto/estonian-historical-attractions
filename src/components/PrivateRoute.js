import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from './UserContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(UserContext);
  if (!user) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
