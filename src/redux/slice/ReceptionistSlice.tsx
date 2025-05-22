import { createSlice } from "@reduxjs/toolkit";

interface ReceptionistState {
  receptionistData: any | null;
}

const initialState: ReceptionistState = {
  receptionistData: (() => {
    try {
      const stored = localStorage.getItem("receptionistData");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn("Error loading receptionistData from localStorage:", err);
      localStorage.removeItem("receptionistData");
      return null;
    }
  })(),
};

const receptionistSlice = createSlice({
  name: "receptionist",
  initialState,
  reducers: {
    addReceptionist(state, action) {
      state.receptionistData = action.payload;
      localStorage.setItem("receptionistData", JSON.stringify(action.payload));
    },
    logoutReceptionist(state) {
      state.receptionistData = null;
      localStorage.removeItem("receptionistData");
      localStorage.removeItem("token");
    },
  },
});

export const { addReceptionist, logoutReceptionist } = receptionistSlice.actions;
export default receptionistSlice.reducer;
