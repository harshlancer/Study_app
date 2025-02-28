import axios from 'axios';
import {DOMParser} from 'react-native-html-parser';

const fetchWcq = async () => {
  try {
    const response = await axios.get(
      'https://www.gktoday.in/quizbase/international-current-affairs',
    );
    const html = response.data;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const quizContainers = doc.getElementsByClassName('sques_quiz');
    const mcqs = [];

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

      mcqs.push({
        question,
        options,
        correctAnswer,
        explanation,
      });
    }

    return mcqs;
  } catch (error) {
    console.error('Error fetching MCQs:', error);
    return [];
  }
};

export default fetchWcq;