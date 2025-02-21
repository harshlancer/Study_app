import axios from 'axios';

const fetchNews = async () => {
  const response = await axios.get('https://example-news-website.com');
  const news = [];

  $('.news-item').each((index, element) => {
    news.push({
      id: index,
      title: $(element).find('.title').text(),
      description: $(element).find('.description').text(),
      image: $(element).find('img').attr('src'),
    });
  });

  return news;
};

export default fetchNews;