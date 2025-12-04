// src/App.js
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Posts from './pages/Posts';
import Stream from './pages/Stream';
import StreamPost from './pages/Streampost';
import NotFound from './pages/Notfound.jsx';
import UserBlogSubmission from './pages/UserBlogSubmission.jsx';
import { VisitorProvider } from './context/VisitorContext';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import DotsLoader from './pages/DotsLoader.jsx';
import './index.css';
import Auth from './pages/Auth.jsx';
import ScrollToTop from './ScrollTop.jsx';
import Document from './pages/document.jsx';

const AppContent = () => {
  const visitorData = useVisitorTracking();
  const location = useLocation();

  const isResourcesRoute = location.pathname.startsWith('/resources');

  return (
    <VisitorProvider value={visitorData}>
      <div className={`app-container ${isResourcesRoute ? "resources-bg" : ""}`}>
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
            <Route path="/blogsubmission" element={<UserBlogSubmission/>}/>
            <Route path="/blog/subscribe" element={<Auth/>}/>
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/verify-email" element={<Auth />} />
            <Route path="/reset-password" element={<Auth />} />
            <Route path="/forgot-password" element={<Auth />} />
            <Route path="/dots" element={<DotsLoader/>}/>
            <Route path="*" element={<NotFound/>}/>
            <Route path="/resources" element={<Document/>}/>
            <Route path="/resources/folder/:folderId" element={<Document/>}/>
            <Route path="/resources/list/:excelId" element={<Document />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </VisitorProvider>
  );
};


const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
};

export default App;