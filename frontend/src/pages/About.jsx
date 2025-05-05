// src/pages/About.js
const About = () => {
    return (
      <section className="section">
        <h2 className="section-title">About Me</h2>
        <div className="card">
          <h3 className="card-title">Professional Summary</h3>
          <p className="card-text">
            As a recent Computer Science graduate, I specialize in full-stack web development using modern technologies like React.js, Node.js, and MongoDB. My flagship project, a case management e-Portal, showcases my ability to build secure, scalable web applications with features like role-based authentication and real-time communication.
          </p>
          <p className="card-text">
            I am driven to innovate, solve complex challenges, and deliver user-centric solutions. My goal is to contribute to cutting-edge projects in a dynamic environment that fosters growth and creativity.
          </p>
        </div>
  
        <div className="grid">
          <div className="card">
            <h3 className="card-title">Education</h3>
            <div className="education-item">
              <h4 className="education-title">B.Tech. - Computer Science & Engineering</h4>
              <p className="education-details">KIET Group of Institutions, 2022 - 2026</p>
              <p className="education-details">Percentage: 84.64 / 100</p>
            </div>
            <div className="education-item">
              <h4 className="education-title">12th Standard</h4>
              <p className="education-details">Vidhaan Public School, Ghaziabad, 2021</p>
              <p className="education-details">Percentage: 93 / 100</p>
            </div>
            <div className="education-item">
              <h4 className="education-title">10th Standard</h4>
              <p className="education-details">SSK Public School, Ghaziabad, 2019</p>
              <p className="education-details">Percentage: 91.20 / 100</p>
            </div>
          </div>
  
          <div className="card">
            <h3 className="card-title">Key Skills</h3>
            <div className="skills">
              {["React.js", "Node.js", "Java", "Javascript", "MongoDB", "SQL", "NoSQL", "Express.js", "HTML", "CSS"].map((skill, index) => (
                <span key={index} className="skill">{skill}</span>
              ))}
            </div>
            <h3 className="card-title card-title-secondary">Personal Details</h3>
            <ul className="personal-details">
              <li><span className="detail-label">Date of Birth:</span> September 6, 2004</li>
              <li><span className="detail-label">Languages:</span> English, Hindi</li>
              <li><span className="detail-label">Interests:</span> Reading Books, Writing Blogs, Cooking</li>
              <li><span className="detail-label">Activities:</span> Debate Competitions, Poem Competition</li>
            </ul>
          </div>
        </div>
      </section>
    );
  };
  
  export default About;