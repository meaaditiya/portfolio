// src/pages/Home.js
import { useNavigate } from 'react-router-dom';
import './Home.css';
const Home = () => {
  const navigate = useNavigate();

  return (
    <section className="section-home">
      <div className="home-content">
        <h2 className="home-subtitle">Hello, I'm</h2>
        <h1 className="home-title">Aaditiya Tyagi</h1>
        <p className="home-role">Full-Stack Web Developer</p>
        <p className="home-description">
          A passionate Computer Science graduate specializing in React.js, Node.js, and MongoDB, crafting innovative and scalable web solutions.
        </p>
        <div className="home-buttons">
          <button
            className="button-primary"
            onClick={() => navigate('/contact')}
          >
            Contact Me
          </button>
          <button
            className="button-secondary"
            onClick={() => navigate('/projects')}
          >
             Projects
          </button>
        </div>
      </div>
      <div className="home-image">
        <div className="avatar">
          AT
          <div className="avatar-glow"></div>
        </div>
      </div>
    </section>
  );
};

export default Home;