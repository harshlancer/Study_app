import axios from 'axios';
import { DOMParser } from 'react-native-html-parser';

const fetchQuotes = async () => {
  try {
    // Fetch the HTML content from the website
    const response = await axios.get('https://www.prevention.com/life/a44189224/life-quotes/');
    const html = response.data;

    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Find the first <ol> element with the specified class
    const quoteList = doc.getElementsByClassName('css-9b1pbo emevuu60')[0];

    if (!quoteList) {
      console.warn('No quotes found on the page.');
      return [];
    }

    // Extract all <li> elements inside the <ol>
    const listItems = quoteList.getElementsByTagName('li');
    const quotes = [];

    for (let i = 0; i < listItems.length; i++) {
      const quoteText = listItems[i].textContent.trim(); // Trim whitespace
      quotes.push(quoteText); // Add the quote to the array
    }

    return quotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
};

export default fetchQuotes;