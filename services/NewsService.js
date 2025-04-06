// newsService.js
import HTMLParser from 'react-native-html-parser';

const extractImageUrl = (article) => {
  try {
    if (!article) return 'https://via.placeholder.com/600x300';
    
    const noscriptElement = article.getElementsByTagName('noscript')[0];
    if (noscriptElement) {
      const noscriptImg = noscriptElement.getElementsByTagName('img')[0];
      if (noscriptImg) return noscriptImg.getAttribute('src') || 'https://via.placeholder.com/600x300';
    }

    const imgElement = article.getElementsByTagName('img')[0];
    if (imgElement) {
      const possibleAttributes = ['src', 'data-src', 'data-nimg'];
      for (const attr of possibleAttributes) {
        const value = imgElement.getAttribute(attr);
        if (value && !value.includes('data:image') && !value.includes('svg+xml')) {
          return value;
        }
      }
    }
    return 'https://via.placeholder.com/600x300';
  } catch (error) {
    console.error('Error extracting image:', error);
    return 'https://via.placeholder.com/600x300';
  }
};

const parseDateString = (dateStr, source) => {
  if (!dateStr) return new Date(0);
  
  const now = new Date();
  const normalizedDateStr = dateStr.toLowerCase().trim();

  if (normalizedDateStr.includes('day ago') || normalizedDateStr.includes('days ago')) {
    const daysAgo = parseInt(normalizedDateStr.match(/\d+/)?.[0] || '0');
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }

  if (normalizedDateStr.includes('hour ago') || normalizedDateStr.includes('hours ago')) {
    const hoursAgo = parseInt(normalizedDateStr.match(/\d+/)?.[0] || '0');
    return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  }

  const monthDayYearPattern = /([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/i;
  const match = normalizedDateStr.match(monthDayYearPattern);
  if (match) {
    const [_, month, day, year] = match;
    const months = {
      january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
      april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
      august: 7, aug: 7, september: 8, sep: 8, october: 9, oct: 9,
      november: 10, nov: 10, december: 11, dec: 11
    };
    return new Date(year, months[month.toLowerCase()] || 0, parseInt(day));
  }

  return new Date(dateStr);
};

const fetchJagranNews = async () => {
  try {
    const response = await fetch('https://www.jagranjosh.com/current-affairs/national-india-1283851987-catlistshow-1');
    const htmlText = await response.text();
    const parser = new HTMLParser.DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const articles = doc.getElementsByClassName('Listing_Listing___EnIi')[0]?.getElementsByTagName('li') || [];
    
    return Array.from(articles).map(article => {
      const titleElement = article.getElementsByTagName('h3')[0]?.getElementsByTagName('a')[0];
      const title = titleElement?.textContent.trim() || 'No Title';
      const url = titleElement?.getAttribute('href') || '#';
      const time = article.getElementsByClassName('Listing_PubDate__LvHzJ')[0]?.textContent.trim() || 'No Time';
      const imageUrl = extractImageUrl(article);
      
      return { title, url, time, imageUrl, source: 'Jagran Josh', category: 'National' };
    });
  } catch (error) {
    console.error('Error fetching Jagran news:', error);
    return [];
  }
};

const fetchGKTodayNews = async (page = 1) => {
  try {
    const response = await fetch(`https://www.gktoday.in/current-affairs/page/${page}/`);
    const htmlText = await response.text();
    const h1Pattern = /<h1\s+id=["']list["']>\s*<a\s+href=["']([^"']+)["']>([^<]+)<\/a>\s*<\/h1>\s*<div\s+class=["']postmeta-primary["']>\s*<span\s+class=["']meta_date["']>([^<]+)<\/span>/g;
    const newsItems = [];
    let match;
    
    while ((match = h1Pattern.exec(htmlText)) !== null) {
      const url = match[1];
      const title = match[2].trim();
      const time = match[3].trim();
      const imgPattern = new RegExp(`<div\\s+class=["']featured_image["'][^>]*>\\s*<a\\s+href=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>\\s*<img[^>]+src=["']([^"']+)["']`, 'i');
      const imgMatch = htmlText.substr(match.index).match(imgPattern);
      const imageUrl = imgMatch?.[1]?.replace(/&/g, '&') || 'https://via.placeholder.com/600x300';
      
      newsItems.push({ title, url, time, imageUrl, source: 'GKToday', category: 'National' });
    }
    return newsItems;
  } catch (error) {
    console.error('Error fetching GKToday news:', error);
    return [];
  }
};

export const fetchNationalNews = async () => {
  try {
    const jagranNews = await fetchJagranNews();
    let gkTodayNews = [];
    for (let page = 1; page <= 2; page++) { // Limiting to 2 pages for preview
      gkTodayNews = [...gkTodayNews, ...(await fetchGKTodayNews(page))];
    }
    
    const allNews = [...jagranNews, ...gkTodayNews];
    return allNews.sort((a, b) => parseDateString(b.time, b.source) - parseDateString(a.time, a.source)).slice(0, 5); // Top 5 latest news
  } catch (error) {
    console.error('Error fetching national news:', error);
    return [];
  }
};