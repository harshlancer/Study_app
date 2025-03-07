import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/Ionicons';
import fetchMCQs from './fetchMCQs';
import LoadingMCQ from './LoadingMCQ';

const {width} = Dimensions.get('window');
const QUESTIONS_PER_PAGE = 25;

const MCQScreen = () => {
  const [allMcqs, setAllMcqs] = useState([]);
  const [displayedMcqs, setDisplayedMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [page, setPage] = useState(1);
  const [score, setScore] = useState({correct: 0, total: 0});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchMCQs();
      setAllMcqs(data);
      
      // Display first batch of questions
      setDisplayedMcqs(data.slice(0, QUESTIONS_PER_PAGE));
      setLoading(false);
    };
    loadData();
  }, []);

  const loadMoreQuestions = () => {
    if (displayedMcqs.length >= allMcqs.length) return;
    
    setLoadingMore(true);
    
    // Calculate next set of questions
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = nextPage * QUESTIONS_PER_PAGE;
    
    // Get more questions from the full set
    const newQuestions = [...displayedMcqs, ...allMcqs.slice(startIndex, endIndex)];
    
    // Update state
    setDisplayedMcqs(newQuestions);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    // If already answered, don't allow changes
    if (selectedAnswers[questionIndex] !== undefined) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
    
    // Check if answer is correct and update score
    const mcq = displayedMcqs[questionIndex];
    const correctLetterMatch = mcq.correctAnswer.match(/^([A-D])\s/);
    const correctLetter = correctLetterMatch ? correctLetterMatch[1] : null;
    
    // If we have a letter match, compare directly with the option label
    const isCorrect = correctLetter 
      ? correctLetter === String.fromCharCode(65 + optionIndex)
      : isCorrectAnswer(mcq, optionIndex);
    
    if (isCorrect) {
      setScore(prev => ({
        ...prev,
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));
    } else {
      setScore(prev => ({
        ...prev,
        total: prev.total + 1,
      }));
    }
    
    // Auto show explanation after selection
    setTimeout(() => {
      setShowExplanations(prev => ({
        ...prev,
        [questionIndex]: true,
      }));
    }, 500);
  };

  const toggleExplanation = questionIndex => {
    setShowExplanations(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  };

  const getOptionLabel = index => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  const isCorrectAnswer = (mcq, selectedOptionIndex) => {
    if (selectedOptionIndex === undefined) return false;

    // Try to match by letter in the correct answer (e.g., "A [Option text]")
    const correctLetterMatch = mcq.correctAnswer.match(/^([A-D])\s/);
    if (correctLetterMatch) {
      const correctLetter = correctLetterMatch[1];
      return correctLetter === String.fromCharCode(65 + selectedOptionIndex);
    }

    // Otherwise try to match by option content
    return mcq.correctAnswer.toLowerCase().includes(
      mcq.options[selectedOptionIndex].toLowerCase()
    );
  };

  const getCorrectOptionIndex = (mcq) => {
    // Try to match by letter in the correct answer (e.g., "A [Option text]")
    const correctLetterMatch = mcq.correctAnswer.match(/^([A-D])\s/);
    if (correctLetterMatch) {
      const correctLetter = correctLetterMatch[1];
      return correctLetter.charCodeAt(0) - 65; // Convert A->0, B->1, etc.
    }

    // Find which option matches the correct answer text
    return mcq.options.findIndex(option =>
      mcq.correctAnswer.toLowerCase().includes(option.toLowerCase())
    );
  };

  const hasMoreQuestions = displayedMcqs.length < allMcqs.length;

  if (loading) {
    return <LoadingMCQ />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#6A1B9A" barStyle="light-content" />
      <ImageBackground
        source={require('./image.png')} // Add this image to your assets folder
        style={styles.backgroundImage}>
        <LinearGradient
          colors={['rgba(106, 27, 154, 0.9)', 'rgba(40, 53, 147, 0.95)']}
          style={styles.gradientOverlay}>
          <ScrollView style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>India GK Quiz</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>
                  Score: {score.correct}/{score.total}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      {width: `${score.total > 0 ? (score.correct / score.total) * 100 : 0}%`}
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.subtitle}>
                Showing {displayedMcqs.length} of {allMcqs.length} Questions
              </Text>
            </View>

            {displayedMcqs.map((mcq, questionIndex) => {
              const correctOptionIndex = getCorrectOptionIndex(mcq);
              const userSelected = selectedAnswers[questionIndex];
              const showExplanation = showExplanations[questionIndex];
              
              return (
                <View key={questionIndex} style={styles.questionContainer}>
                  <LinearGradient
                    colors={['#7B1FA2', '#6A1B9A']}
                    style={styles.questionHeader}>
                    <Text style={styles.questionNumber}>
                      Question {questionIndex + 1}
                    </Text>
                    {userSelected !== undefined && (
                      <View style={[
                        styles.resultBadge,
                        userSelected === correctOptionIndex 
                          ? styles.correctBadge 
                          : styles.incorrectBadge
                      ]}>
                        <Icon 
                          name={userSelected === correctOptionIndex ? 'checkmark' : 'close'} 
                          size={12} 
                          color="white" 
                        />
                      </View>
                    )}
                  </LinearGradient>
                  
                  <View style={styles.questionContent}>
                    <Text style={styles.questionText}>{mcq.question}</Text>

                    <View style={styles.optionsContainer}>
                      {mcq.options.map((option, optionIndex) => {
                        const isSelected = selectedAnswers[questionIndex] === optionIndex;
                        const isCorrect = optionIndex === correctOptionIndex;
                        const showResult = showExplanation || (isSelected && isCorrect);
                        
                        return (
                          <TouchableOpacity
                            key={optionIndex}
                            style={[
                              styles.optionButton,
                              isSelected && styles.selectedOption,
                              showResult && isCorrect && styles.correctOption,
                              showResult && isSelected && !isCorrect && styles.incorrectOption,
                            ]}
                            onPress={() => handleSelectOption(questionIndex, optionIndex)}>
                            <View style={[
                              styles.optionLabelContainer,
                              isSelected && styles.selectedOptionLabel,
                              showResult && isCorrect && styles.correctOptionLabel,
                              showResult && isSelected && !isCorrect && styles.incorrectOptionLabel,
                            ]}>
                              <Text style={styles.optionLabel}>
                                {getOptionLabel(optionIndex)}
                              </Text>
                            </View>
                            <Text style={[
                              styles.optionText,
                              isSelected && styles.selectedOptionText,
                            ]}>
                              {option}
                            </Text>
                            {showResult && isCorrect && (
                              <View style={styles.checkmarkContainer}>
                                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={styles.actionContainer}>
                      <TouchableOpacity
                        style={[
                          styles.showAnswerButton,
                          showExplanation && styles.hideAnswerButton
                        ]}
                        onPress={() => toggleExplanation(questionIndex)}>
                        <Text style={styles.showAnswerButtonText}>
                          {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                        </Text>
                        <Icon 
                          name={showExplanation ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color="white"
                          style={{marginLeft: 5}}
                        />
                      </TouchableOpacity>
                    </View>

                    {showExplanation && (
                      <View style={styles.explanationContainer}>
                        <Text style={styles.correctAnswerText}>
                          Correct Answer: {mcq.correctAnswer}
                        </Text>
                        <Text style={styles.explanationText}>{mcq.explanation}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {hasMoreQuestions && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreQuestions}
                disabled={loadingMore}>
                {loadingMore ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.loadMoreButtonContent}>
                    <Text style={styles.loadMoreButtonText}>
                      Load More Questions
                    </Text>
                    <Icon name="arrow-down" size={18} color="white" style={{marginLeft: 5}} />
                  </View>
                )}
              </TouchableOpacity>
            )}

            {!hasMoreQuestions && displayedMcqs.length > 0 && (
              <View style={styles.allLoadedContainer}>
                <Icon name="checkmark-done-circle" size={24} color="#9575CD" />
                <Text style={styles.allLoadedText}>
                  All questions loaded!
                </Text>
              </View>
            )}

            {/* Add some bottom padding for better UX */}
            <View style={{height: 40}} />
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6A1B9A',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  scoreContainer: {
    width: '80%',
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  questionContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  questionNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  resultBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctBadge: {
    backgroundColor: '#4CAF50',
  },
  incorrectBadge: {
    backgroundColor: '#F44336',
  },
  questionContent: {
    padding: 16,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 24,
    color: '#333',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f5f5f7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  optionLabelContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  selectedOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  selectedOptionLabel: {
    backgroundColor: '#81C784',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  correctOptionLabel: {
    backgroundColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderColor: '#E57373',
  },
  incorrectOptionLabel: {
    backgroundColor: '#E57373',
  },
  optionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
    color: '#444',
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#7B1FA2',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  hideAnswerButton: {
    backgroundColor: '#5E35B1',
  },
  showAnswerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 15,
    backgroundColor: '#F3E5F5',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  correctAnswerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  loadMoreButton: {
    backgroundColor: '#5E35B1',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 20,
    marginHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadMoreButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  allLoadedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 16,
  },
  allLoadedText: {
    textAlign: 'center',
    color: '#9575CD',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MCQScreen;