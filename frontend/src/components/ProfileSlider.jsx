import React from 'react';
import { 
  Code, 
  Database, 
  Server, 
  Cloud, 
  Globe,
  GraduationCap,
  Award,
  BookOpen,
  Heart,
  Camera,
  Music,
  Palette,
  Coffee,
  Mountain,
  Plane,
  Layers,
  FileCode,
  GitBranch
} from 'lucide-react';
import '../pagesCSS/ProfileSlider.css';

const ProfileSlider = () => {
  const profileData = [
    // Technical Skills
    { 
      icon: Globe, 
      title: 'React.js', 
      description: 'Building dynamic UIs with modern React',
      color: '#61DAFB',
      category: 'technical'
    },
    { 
      icon: Server, 
      title: 'Node.js', 
      description: 'Scalable backend development',
      color: '#339933',
      category: 'technical'
    },
    { 
      icon: Layers, 
      title: 'Spring Boot', 
      description: 'Enterprise Java applications',
      color: '#6DB33F',
      category: 'technical'
    },
    { 
      icon: FileCode, 
      title: 'JavaScript', 
      description: 'Modern ES6+ development',
      color: '#F7DF1E',
      category: 'technical'
    },
    { 
      icon: Database, 
      title: 'MongoDB', 
      description: 'NoSQL database management',
      color: '#47A248',
      category: 'technical'
    },
    { 
      icon: Code, 
      title: 'Java', 
      description: 'Object-oriented programming',
      color: '#007396',
      category: 'technical'
    },
    { 
      icon: Database, 
      title: 'SQL', 
      description: 'Relational database design',
      color: '#4479A1',
      category: 'technical'
    },
    { 
      icon: Cloud, 
      title: 'AWS', 
      description: 'Cloud infrastructure & deployment',
      color: '#FF9900',
      category: 'technical'
    },
    { 
      icon: GitBranch, 
      title: 'Git', 
      description: 'Version control & collaboration',
      color: '#F05032',
      category: 'technical'
    },
    
    // Education
    { 
      icon: GraduationCap, 
      title: 'B.Tech CSE', 
      description: 'KIET Group of Institutions | CGPA: 8.73',
      color: '#8B5CF6',
      category: 'education'
    },
    { 
      icon: Award, 
      title: 'Higher Secondary', 
      description: 'Vidhaan Public School | 93%',
      color: '#EC4899',
      category: 'education'
    },
    { 
      icon: BookOpen, 
      title: 'Secondary Education', 
      description: 'SSK Public School | 91.20%',
      color: '#F59E0B',
      category: 'education'
    },
    
    // Passions & Interests
    { 
      icon: Camera, 
      title: 'Photography', 
      description: 'Capturing moments and stories',
      color: '#EF4444',
      category: 'passion'
    },
    { 
      icon: Music, 
      title: 'Music', 
      description: 'Creating and enjoying melodies',
      color: '#10B981',
      category: 'passion'
    },
    { 
      icon: Palette, 
      title: 'Design', 
      description: 'UI/UX and visual creativity',
      color: '#3B82F6',
      category: 'passion'
    },
    { 
      icon: Coffee, 
      title: 'Coffee Enthusiast', 
      description: 'Exploring different brews and flavors',
      color: '#92400E',
      category: 'passion'
    },
    { 
      icon: Mountain, 
      title: 'Travel', 
      description: 'Exploring new places and cultures',
      color: '#059669',
      category: 'passion'
    },
    { 
      icon: Plane, 
      title: 'Adventure', 
      description: 'Seeking new experiences',
      color: '#7C3AED',
      category: 'passion'
    }
  ];

  // Duplicate for seamless loop
  const duplicatedData = [...profileData, ...profileData];

  return (
    <div className="profile-carousel-wrapper">
      <div className="profile-carousel-box">
        <div className="profile-carousel-rail">
          {duplicatedData.map((item, index) => {
            const IconComponent = item.icon;
            
            return (
              <div
                key={`${item.title}-${index}`}
                className="profile-carousel-tile"
              >
                <div className="profile-tile-frame">
                  <div className="profile-tile-body">
                    <div className="profile-bg-mark">
                      <IconComponent 
                        className="profile-mark-icon" 
                        style={{ color: item.color, opacity: 0.1 }}
                      />
                    </div>
                    <div 
                      className="profile-icon-circle"
                      style={{ backgroundColor: item.color }}
                    >
                      <IconComponent className="profile-circle-icon" />
                    </div>
                    <h4 className="profile-tile-heading">
                      {item.title}
                    </h4>
                    <p className="profile-tile-text">
                      {item.description}
                    </p>
                    <span 
                      className="profile-tile-badge"
                      style={{ color: item.color }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileSlider;