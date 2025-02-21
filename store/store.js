import { configureStore } from '@reduxjs/toolkit';
import rewardsReducer from './rewardsSlice';

const store = configureStore({
  reducer: {
    rewards: rewardsReducer,
  },
});

export default store;