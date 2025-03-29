import React, { useEffect, useState } from 'react';
import fetchNews from '../services/newsService';

const useNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const loadNews = async () => {
      const data = await fetchNews();
      setNews(data);
    };
    loadNews();
  }, []);

  return { news };
};

export default useNews;