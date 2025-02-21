import { createSlice } from '@reduxjs/toolkit';

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: { points: 0, badges: [] },
  reducers: {
    addPoints: (state, action) => {
      state.points += action.payload;
    },
    addBadge: (state, action) => {
      state.badges.push(action.payload);
    },
  },
});

export const { addPoints, addBadge } = rewardsSlice.actions;
export default rewardsSlice.reducer;