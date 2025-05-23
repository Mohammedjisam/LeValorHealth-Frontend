// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/store';

// interface Props {
//   children: JSX.Element;
// }

// const ProtectedReceptionistRoutes: React.FC<Props> = ({ children }) => {
//   const receptionistData = useSelector((state: RootState) => state.receptionist.receptionistData);
//   return receptionistData ? children : <Navigate to="/login" />;
// };

// export default ProtectedReceptionistRoutes;
