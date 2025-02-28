import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import fetchMCQs from './fetchwcq';
const WCQscreen = () => {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchMCQs();
      setMcqs(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSelectOption = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const toggleExplanation = (questionIndex) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  const isCorrectAnswer = (mcq, selectedOptionIndex) => {
    if (selectedOptionIndex === undefined) return false;
    
    // Find which option matches the correct answer text
    const correctOptionIndex = mcq.options.findIndex(
      option => option.toLowerCase().includes(mcq.correctAnswer.toLowerCase())
    );
    
    return selectedOptionIndex === correctOptionIndex;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading questions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>India Government & Politics Quiz</Text>
      <Text style={styles.subtitle}>{mcqs.length} Questions</Text>
      
      {mcqs.map((mcq, questionIndex) => (
        <View key={questionIndex} style={styles.questionContainer}>
          <Text style={styles.questionNumber}>Question {questionIndex + 1}</Text>
          <Text style={styles.questionText}>{mcq.question}</Text>
          
          <View style={styles.optionsContainer}>
            {mcq.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={[
                  styles.optionButton,
                  selectedAnswers[questionIndex] === optionIndex && styles.selectedOption,
                  showExplanations[questionIndex] && 
                    isCorrectAnswer(mcq, optionIndex) && 
                    styles.correctOption,
                  showExplanations[questionIndex] && 
                    selectedAnswers[questionIndex] === optionIndex &&
                    !isCorrectAnswer(mcq, optionIndex) && 
                    styles.incorrectOption
                ]}
                onPress={() => handleSelectOption(questionIndex, optionIndex)}
              >
                <Text style={styles.optionLabel}>{getOptionLabel(optionIndex)}</Text>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.showAnswerButton}
              onPress={() => toggleExplanation(questionIndex)}
            >
              <Text style={styles.showAnswerButtonText}>
                {showExplanations[questionIndex] ? 'Hide Answer' : 'Show Answer'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showExplanations[questionIndex] && (
            <View style={styles.explanationContainer}>
              <Text style={styles.correctAnswerText}>
                Correct Answer: {mcq.correctAnswer}
              </Text>
              <Text style={styles.explanationText}>
                {mcq.explanation}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  questionContainer: {
    marginBottom: 28,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f0f0f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#e6f2ff',
    borderColor: '#4a90e2',
  },
  correctOption: {
    backgroundColor: '#e7f7e7',
    borderColor: '#5cb85c',
  },
  incorrectOption: {
    backgroundColor: '#ffeeee',
    borderColor: '#d9534f',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#444',
    width: 20,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  showAnswerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showAnswerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  correctAnswerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c7a2c',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 16,
  },
});

export default WCQscreen;