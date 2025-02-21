import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
const categories = ['National', 'World', 'Business', 'Sports', 'Tech', 'Bookmarks'];

const CategoryBar = () => {
  const navigation = useNavigation();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={styles.categoryButton}
          activeOpacity={0.8}
          onPress={() => {
            if (category === 'National') {
              navigation.navigate('National');
            } else if (category === 'Bookmarks') {
              navigation.navigate('Bookmarks');
            }
          }}
          
        >
          <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradient}>
            <Text style={styles.categoryText}>{category}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,  
    paddingHorizontal: 10,
  },
  categoryButton: {
    marginHorizontal: 6,
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
});

export default CategoryBar;
