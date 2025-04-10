import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
  },
  reducers: {
    login: (state, action) => {
      state.currentUser = action.payload;
    },
    updatedUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

export const { login, updatedUser } = userSlice.actions;
export default userSlice.reducer;