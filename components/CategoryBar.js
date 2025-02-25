import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const categories = ['National', 'World', 'Business', 'Sports', 'Tech', 'Bookmarks'];

const CategoryBar = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('National');

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    navigation.navigate(category);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => handleCategoryPress(category)}
          >
            <LinearGradient
              colors={
                selectedCategory === category
                  ? ['#FF6F61', '#FFA500'] // Highlight for active category
                  : ['#1E1E1E', '#3A3A3A'] // Default gradient
              }
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory, 
              ]}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60, // Restrict height
    backgroundColor: '#121212', // Dark background
    justifyContent: 'center',
    paddingVertical: 5,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25, // Rounded corners
    marginHorizontal: 6,
    elevation: 5, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  selectedCategory: {
    borderWidth: 2, 
    borderColor: '#fff', 
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
});

export default CategoryBar;
