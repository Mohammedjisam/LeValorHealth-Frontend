// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store";

// interface Props {
//   children: JSX.Element;
// }

// const ProtectedScannerLogin: React.FC<Props> = ({ children }) => {
//   const scannerData = useSelector((state: RootState) => state.scanner.scannerData);
//   return scannerData ? <Navigate to="/scanner/dashboard" /> : children;
// };

// export default ProtectedScannerLogin;
