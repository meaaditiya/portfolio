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
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;