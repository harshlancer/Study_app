import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPoints, addBadge } from '../store/rewardsSlice';

const useRewards = () => {
  const rewards = useSelector((state) => state.rewards);
  const dispatch = useDispatch();

  const awardPoints = (points) => {
    dispatch(addPoints(points));
  };

  const awardBadge = (badge) => {
    dispatch(addBadge(badge));
  };

  return { ...rewards, awardPoints, awardBadge };
};

export default useRewards;