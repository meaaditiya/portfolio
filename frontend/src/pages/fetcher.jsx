// BackgroundFetcher.js
import { useEffect } from 'react';
import axios from 'axios';

const BackgroundFetcher = () => {
  useEffect(() => {
    const fetchBlogs = () => {
      axios.get('https://connectwithaaditiyamg.onrender.com/api/blogs?status=published&limit=6')
        .then(response => {
          console.log('Fetched in background:', response.data);
          // You can store this in context, Redux, or just log it
        })
        .catch(error => {
          console.error('Error fetching blogs:', error);
        });
    };

    fetchBlogs(); // initial fetch
    const interval = setInterval(fetchBlogs, 100000); // fetch every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return null; // This component renders nothing
};

export default BackgroundFetcher;
