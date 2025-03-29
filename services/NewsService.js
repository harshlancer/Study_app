import HTMLParser from 'react-native-html-parser';

const extractImageUrl = (article) => {
  try {
    if (!article) return 'https://via.placeholder.com/600x300';

    const noscriptElement = article.getElementsByTagName('noscript')[0];
    if (noscriptElement) {
      const noscriptImg = noscriptElement.getElementsByTagName('img')[0];
      if (noscriptImg) {
        const src = noscriptImg.getAttribute('src');
        if (src) return src;
      }
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

      const style = imgElement.getAttribute('style');
      if (style) {
        const match = style.match(/background-image:url\("([^"]+)"\)/);
        if (match && match[1]) return match[1];
      }
    }

    return 'https://via.placeholder.com/600x300';
  } catch (error) {
    console.error('Error extracting image:', error);
    return 'https://via.placeholder.com/600x300';
  }
};

const fetchJagranNews = async () => {
  try {
    const response = await fetch(
      'https://www.jagranjosh.com/current-affairs/national-india-1283851987-catlistshow-1',
    );
    const htmlText = await response.text();

    if (!htmlText || htmlText.trim() === '') {
      console.warn('Empty response from Jagran');
      return [];
    }

    const parser = new HTMLParser.DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const sections = doc.getElementsByClassName('Listing_Listing___EnIi');
    if (!sections.length) return [];

    const targetSection = sections[0];
    const articles = targetSection.getElementsByTagName('li');
    const extractedNews = [];

    for (let i = 0; i < articles.length; i++) {
      try {
        const article = articles[i];
        const titleElement = article
          .getElementsByTagName('h3')[0]
          ?.getElementsByTagName('a')[0];
        if (!titleElement) continue;

        const title = titleElement.textContent.trim() || 'No Title';
        const url = titleElement.getAttribute('href') || '#';
        const timeElement = article.getElementsByClassName('Listing_PubDate__LvHzJ')[0];
        const time = timeElement?.textContent.trim() || 'No Time';
        const imageUrl = extractImageUrl(article);

        let summary = '';
        const paragraphs = article.getElementsByTagName('p');
        if (paragraphs && paragraphs.length > 0) {
          summary = paragraphs[0].textContent.trim();
        }

        extractedNews.push({
          title,
          url,
          time,
          imageUrl,
          summary,
          source: 'Jagran Josh',
        });
      } catch (error) {
        console.warn('Error parsing Jagran article', error);
      }
    }

    return extractedNews;
  } catch (error) {
    console.error('Error fetching Jagran news:', error);
    return [];
  }
};

const fetchGKTodayNews = async (page = 1) => {
  try {
    const response = await fetch(
      `https://www.gktoday.in/current-affairs/page/${page}/`,
    );
    const htmlText = await response.text();

    if (!htmlText || htmlText.trim() === '') {
      console.warn(`Empty response from GKToday page ${page}`);
      return [];
    }

    const newsItems = [];
    const h1Pattern = /<h1\s+id=["']list["']>\s*<a\s+href=["']([^"']+)["']>([^<]+)<\/a>\s*<\/h1>\s*<div\s+class=["']postmeta-primary["']>\s*<span\s+class=["']meta_date["']>([^<]+)<\/span>/g;

    let match;
    while ((match = h1Pattern.exec(htmlText)) !== null) {
      try {
        const url = match[1];
        const title = match[2].trim();
        const time = match[3].trim();
        const afterMatchText = htmlText.substr(match.index);

        const imgPattern = new RegExp(
          `<div\\s+class=["']featured_image["'][^>]*>\\s*<a\\s+href=["']${url.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
          )}["'][^>]*>\\s*<img[^>]+src=["']([^"']+)["']`,
          'i',
        );
        const imgMatch = afterMatchText.match(imgPattern);

        let imageUrl = 'https://via.placeholder.com/600x300';
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1].replace(/&amp;/g, '&');
        }

        let summary = '';
        const summaryPattern = /<div\s+class=["']featured_image["'][^>]*>.*?<\/div>\s*<p>([^<]+)<\/p>/is;
        const summaryMatch = afterMatchText.match(summaryPattern);

        if (summaryMatch && summaryMatch[1]) {
          summary = summaryMatch[1].trim();
        }

        newsItems.push({
          title,
          url,
          time,
          imageUrl,
          summary,
          source: 'GKToday',
        });
      } catch (error) {
        console.warn('Error processing GKToday article', error);
      }
    }

    return newsItems;
  } catch (error) {
    console.error(`Error fetching GKToday news from page ${page}:`, error);
    return [];
  }
};

const fetchIndianExpressNews = async () => {
  try {
    const response = await fetch(
      'https://indianexpress.com/about/current-affairs/',
    );
    const htmlText = await response.text();

    if (!htmlText || htmlText.trim() === '') {
      console.warn('Empty response from Indian Express');
      return [];
    }

    const parser = new HTMLParser.DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const newsDetails = doc.getElementsByClassName('details');
    const extractedNews = [];

    for (let i = 0; i < newsDetails.length; i++) {
      try {
        const detail = newsDetails[i];
        const titleElement = detail
          .getElementsByTagName('h3')[0]
          ?.getElementsByTagName('a')[0];
        if (!titleElement) continue;

        const title = titleElement.textContent.trim() || 'No Title';
        const url = titleElement.getAttribute('href') || '#';
        const paragraphs = detail.getElementsByTagName('p');
        const time = paragraphs[0]?.textContent.trim() || 'No Time';

        let summary = '';
        if (paragraphs && paragraphs.length > 1) {
          summary = paragraphs[1].textContent.trim();
        }

        const thumbDiv = detail.getElementsByClassName('about-thumb')[0];
        let imageUrl = 'https://via.placeholder.com/600x300';

        if (thumbDiv) {
          const imgElement = thumbDiv.getElementsByTagName('img')[0];
          if (imgElement) {
            imageUrl =
              imgElement.getAttribute('data-src') ||
              imgElement.getAttribute('src') ||
              imageUrl;
          }
        }

        extractedNews.push({
          title,
          url,
          time,
          imageUrl,
          summary,
          source: 'Indian Express',
        });
      } catch (error) {
        console.warn('Error parsing Indian Express article', error);
      }
    }

    return extractedNews;
  } catch (error) {
    console.error('Error fetching Indian Express news:', error);
    return [];
  }
};

export const fetchNationalNews = async () => {
  try {
    // Fetch from all sources in parallel
    const [jagranNews, gkTodayPage1, gkTodayPage2, gkTodayPage3, indianExpressNews] = 
      await Promise.all([
        fetchJagranNews(),
        fetchGKTodayNews(1),
        fetchGKTodayNews(2),
        fetchGKTodayNews(3),
        fetchIndianExpressNews()
      ]);

    const allNews = [
      ...jagranNews,
      ...gkTodayPage1,
      ...gkTodayPage2,
      ...gkTodayPage3,
      ...indianExpressNews
    ];

    // Sort by date (simplified for example)
    return allNews.sort((a, b) => {
      return new Date(b.time || 0) - new Date(a.time || 0);
    });
  } catch (error) {
    console.error('Error fetching national news:', error);
    return [];
  }
};