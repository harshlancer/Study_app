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
import Icon from 'react-native-vector-icons/Ionicons';
import fetchMCQs from './fetchwcq';
import LoadingMCQ from './LoadingMCQ';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeMediaView,
  NativeMediaAspectRatio,
  NativeAssetType,
  NativeAdChoicesPlacement,
} from 'react-native-google-mobile-ads';
import NativeAdCard from './NativeAdCard';
import { updateQuestionStats } from '../services/statsTracker';

const {width} = Dimensions.get('window');
const AD_UNIT_ID = 'ca-app-pub-3382805190620235/9520816115';

const WCQscreen = () => {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [score, setScore] = useState({correct: 0, total: 0});
  const [nativeAd, setNativeAd] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchMCQs();
      setMcqs(data);
      setLoading(false);
    };
    loadData();

    const loadAd = async () => {
      try {
        const ad = await NativeAd.createForAdRequest(AD_UNIT_ID, {
          aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
          adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
          startVideoMuted: true,
          requestNonPersonalizedAdsOnly: true,
        });
        setNativeAd(ad);
      } catch (error) {
        console.error('Error loading native ad:', error);
      }
    };

    loadAd();

    return () => {
      if (nativeAd && typeof nativeAd.destroy === 'function') {
        nativeAd.destroy();
      }
    };
  }, []);

  const renderQuestionItem = ({item: mcq, index: questionIndex}) => {
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
  };

  const renderItem = ({item, index}) => {
    if (index > 0 && index % 3 === 0 && nativeAd) {
      return (
        <>
          {renderQuestionItem({item, index})}
          <NativeAdCard nativeAd={nativeAd} />
        </>
      );
    }
    
    return renderQuestionItem({item, index});
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (selectedAnswers[questionIndex] !== undefined) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
    
    const mcq = mcqs[questionIndex];
    const isCorrect = isCorrectAnswer(mcq, optionIndex);
    
    // Update question stats in progress tracker
    updateQuestionStats();
    
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
    return String.fromCharCode(65 + index);
  };

  const isCorrectAnswer = (mcq, selectedOptionIndex) => {
    if (selectedOptionIndex === undefined) return false;
    return selectedOptionIndex === getCorrectOptionIndex(mcq);
  };

  const getCorrectOptionIndex = (mcq) => {
    return mcq.options.findIndex(option =>
      mcq.correctAnswer.toLowerCase().includes(option.toLowerCase())
    );
  };

  if (loading) {
    return <LoadingMCQ />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#6A1B9A" barStyle="light-content" />
      <ImageBackground
        source={require('./image.png')}
        style={styles.backgroundImage}>
        <LinearGradient
          colors={['rgba(106, 27, 154, 0.9)', 'rgba(40, 53, 147, 0.95)']}
          style={styles.gradientOverlay}>
          <ScrollView style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>
                World affairs and GeoPolitics Quiz
              </Text>
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
              <Text style={styles.subtitle}>{mcqs.length} Questions</Text>
            </View>

            {mcqs.map((mcq, index) => (
              <View key={index}>
                {renderItem({item: mcq, index})}
              </View>
            ))}

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
});

export default WCQscreen;