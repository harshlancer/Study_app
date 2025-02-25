import React from 'react';
import { View } from 'react-native';
import CategoryBar from './CategoryBar';

const MainLayout = ({ children, showCategoryBar = true }) => {
  return (
    <View style={{ flex: 1 }}>
      {showCategoryBar && <CategoryBar />}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
};

export default MainLayout;