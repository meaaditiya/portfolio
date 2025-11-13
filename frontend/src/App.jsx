// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import './index.css';
import Posts from './pages/Posts';
import Stream from './pages/Stream';
import StreamPost from './pages/Streampost';
import NotFound from './pages/Notfound.jsx';
import UserBlogSubmission from './pages/UserBlogSubmission.jsx';
import PostSkeletonLoader from './pages/PostSkeleton.jsx';
const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/stream" element={<Stream/>}/>
            <Route path="/streampost/:id" element={<StreamPost/>}/>
            <Route path="/posts/:postId" element={<Posts />} />
            <Route path="/social" element={<Posts />} />
            <Route path="/community" element={<Posts />} />
            <Route path="/pagenotfound" element={<NotFound/>}/>
            <Route path ="/blogsubmission" element={<UserBlogSubmission/>}/>
            <Route path="/image" element= {<PostSkeletonLoader/>}/>
            {/* Catch-all route for 404 - must be last */}
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;