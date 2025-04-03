import axios from 'axios';
import {DOMParser} from 'react-native-html-parser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys
const CACHE_KEYS = {
  WCQ_DATA: 'wcq_data',
  FETCH_TIMESTAMP: 'wcq_fetch_timestamp'
};

// How long to keep the cache (24 hours in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const fetchWcq = async () => {
  try {
    // Try to get cached data first
    const cachedData = await getCachedWcqs();
    if (cachedData) {
      return cachedData;
    }
    
    // Fetch fresh data if cache not available
    const wcqs = await fetchFreshWcqs();
    
    // Cache the new data
    if (wcqs.length > 0) {
      await cacheWcqs(wcqs);
    }
    
    return wcqs;
  } catch (error) {
    console.error('Error in fetchWcqs:', error);
    
    // If there's an error with fresh fetch, try to use cached data even if expired
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.WCQ_DATA);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error('Error getting emergency cached data:', cacheError);
    }
    
    return []; // Return empty array if all fails
  }
};

const fetchFreshWcqs = async () => {
  const response = await axios.get(
    'https://www.gktoday.in/quizbase/international-current-affairs',
  );
  const html = response.data;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const quizContainers = doc.getElementsByClassName('sques_quiz');
  const wcqs = [];

  for (let i = 0; i < quizContainers.length; i++) {
    const quiz = quizContainers[i];

    // Extracting the question text properly
    const questionElement = quiz.getElementsByClassName(
      'wp_quiz_question testclass',
    )[0];
    let question = 'Question not found';

    if (questionElement) {
      const spanElement = questionElement.getElementsByTagName('span')[0]; // The span containing the number
      if (spanElement) {
        spanElement.parentNode.removeChild(spanElement); // Remove the number
      }
      question = questionElement.textContent.trim();
    }

    // Extracting options with improved parsing
    const optionsElement = quiz.getElementsByClassName(
      'wp_quiz_question_options',
    )[0];
    let options = [];

    if (optionsElement) {
      // Get the text content and process it
      const optionsText = optionsElement.textContent.trim();
      
      // Split by the option identifiers like [A], [B], etc.
      const optionParts = optionsText.split(/\[\w\]\s*/);
      
      // Filter out empty strings and trim each option
      options = optionParts
        .filter(option => option.trim().length > 0)
        .map(option => option.trim());
    }

    // Extracting the correct answer
    const answerElement = quiz.getElementsByClassName('ques_answer')[0];
    const correctAnswer =
      answerElement?.textContent?.replace('Correct Answer:', '').trim() ||
      'Answer not available';

    // Extracting explanation
    const explanationElement = quiz.getElementsByClassName('answer_hint')[0];
    const explanation =
      explanationElement?.textContent?.replace('Notes:', '').trim() ||
      'No explanation provided';

    wcqs.push({
      question,
      options,
      correctAnswer,
      explanation,
    });
  }

  return wcqs;
};

const getCachedWcqs = async () => {
  try {
    // Get the timestamp of when the data was cached
    const timestampStr = await AsyncStorage.getItem(CACHE_KEYS.FETCH_TIMESTAMP);
    
    if (!timestampStr) {
      return null; // No timestamp means no valid cache
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION) {
      return null; // Cache expired
    }
    
    // Get and parse the cached data
    const cachedData = await AsyncStorage.getItem(CACHE_KEYS.WCQ_DATA);
    if (!cachedData) {
      return null;
    }
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
};

const cacheWcqs = async (wcqs) => {
  try {
    // Store the data
    await AsyncStorage.setItem(CACHE_KEYS.WCQ_DATA, JSON.stringify(wcqs));
    
    // Store the timestamp
    await AsyncStorage.setItem(CACHE_KEYS.FETCH_TIMESTAMP, Date.now().toString());
    
  } catch (error) {
    console.error('Error caching WCQ data:', error);
  }
};

export default fetchWcq;