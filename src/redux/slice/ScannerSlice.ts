// import { createSlice } from "@reduxjs/toolkit";

// interface ScannerState {
//   scannerData: any | null;
// }

// const initialState: ScannerState = {
//   scannerData: (() => {
//     try {
//       const stored = localStorage.getItem("scannerData");
//       return stored && stored !== "undefined" ? JSON.parse(stored) : null;
//     } catch (err) {
//       console.warn("Error loading scannerData from localStorage:", err);
//       localStorage.removeItem("scannerData");
//       return null;
//     }
//   })(),
// };

// const scannerSlice = createSlice({
//   name: "scanner",
//   initialState,
//   reducers: {
//     addScanner(state, action) {
//       state.scannerData = action.payload;
//       localStorage.setItem("scannerData", JSON.stringify(action.payload));
//     },
//     logoutScanner(state) {
//       state.scannerData = null;
//       localStorage.removeItem("scannerData");
//       localStorage.removeItem("token");
//     },
//   },
// });

// export const { addScanner, logoutScanner } = scannerSlice.actions;
// export default scannerSlice.reducer;
