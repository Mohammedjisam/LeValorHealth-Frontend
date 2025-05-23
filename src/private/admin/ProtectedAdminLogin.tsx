// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";

// interface Props {
//   children: JSX.Element;
// }

// const ProtectedAdminLogin: React.FC<Props> = ({ children }) => {
//   const adminData = useSelector((state: RootState) => state.admin.adminData);
//   return adminData ? <Navigate to="/admin/dashboard" /> : children;
// };

// export default ProtectedAdminLogin;
