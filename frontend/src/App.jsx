import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
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
import Forbidden from './pages/Forbidden.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import "./api/globalFetch";
import { setFetchNavigator } from "./api/globalFetch";

const AppContent = () => {
  const visitorData = useVisitorTracking();
  const location = useLocation();

  const isResourcesRoute = location.pathname.startsWith('/resources') || 
                           location.pathname.startsWith('/access');

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
            {/* <Route path="/community" element={<Posts />} /> */}
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
            <Route path="/resources" element={<Document/>}/>
            <Route path="/resources/folder/:folderId" element={<Document/>}/>
            <Route path="/resources/list/:excelId" element={<Document />} />
            <Route path="/access/:id" element={<AccessRedirect />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound/>}/>
           
          </Routes>
        </main>
        
        <Footer />
      </div>
    </VisitorProvider>
  );
};

const AccessRedirect = () => {
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [redirectPath, setRedirectPath] = React.useState(null);
  
  React.useEffect(() => {
    const handleAccess = async () => {
      const params = new URLSearchParams(location.search);
      const key = params.get('key');
      const pathParts = location.pathname.split('/');
      const documentId = pathParts[pathParts.length - 1];
      
      if (!key) {
        setRedirectPath('/resources');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/api/item/${documentId}?key=${key}`
        );
        
        if (!response.ok) {
          setRedirectPath('/resources');
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        switch(data.type) {
          case 'folder':
            setRedirectPath(`/resources/folder/${documentId}?key=${key}`);
            break;
          case 'excel':
            setRedirectPath(`/resources/list/${documentId}?key=${key}`);
            break;
          default:
            setRedirectPath(`/resources?key=${key}`);
            break;
        }
        
      } catch (err) {
        setRedirectPath('/resources');
      } finally {
        setLoading(false);
      }
    };
    
    handleAccess();
  }, [location]);
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }
  
  return redirectPath ? <Navigate to={redirectPath} replace /> : null;
};

const NavigatorWrapper = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    setFetchNavigator(navigate);
  }, []);
  return <AppContent />;
};


const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <NavigatorWrapper />
    </Router>
  );
};

export default App;
