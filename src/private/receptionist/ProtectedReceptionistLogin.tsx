// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store";

// interface Props {
//   children: JSX.Element;
// }

// const ProtectedReceptionistLogin: React.FC<Props> = ({ children }) => {
//   const receptionistData = useSelector((state: RootState) => state.receptionist.receptionistData);
//   return receptionistData ? <Navigate to="/dashboard" /> : children;
// };

// export default ProtectedReceptionistLogin;
