import React from 'react';
import { 
  Lock, 
  Mail, 
  MousePointerClick, 
  Shield, 
  Crown,
  AlertCircle,
  FileCheck,
  UserCheck
} from 'lucide-react';
import '../pagesCSS/DocumentSlider.css';

const DocumentSlider = () => {
  const infoItems = [
    { 
      icon: Lock, 
      text: 'To access private documents, send an access request to admin by double-clicking on the folder or file',
      color: '#EF4444'
    },
    { 
      icon: Mail, 
      text: 'An email will be sent to you after reviewing your request to access the document',
      color: '#3B82F6'
    },
    { 
      icon: MousePointerClick, 
      text: 'Double-click on any item to open it',
      color: '#10B981'
    },
    { 
      icon: Shield, 
      text: 'Do not share documents from this site as they are copyrighted',
      color: '#F59E0B'
    },
    { 
      icon: Crown, 
      text: 'Become a premium user to access all private documents instantly',
      color: '#8B5CF6'
    },
    { 
      icon: FileCheck, 
      text: 'Bookmark important documents for quick access',
      color: '#EC4899'
    },
    { 
      icon: UserCheck, 
      text: 'Login to sync your bookmarks and access history across devices',
      color: '#06B6D4'
    },
    { 
      icon: AlertCircle, 
      text: 'All document access is monitored and logged for security purposes',
      color: '#DC2626'
    }
  ];

  // Duplicate for seamless loop
  const duplicatedItems = [...infoItems, ...infoItems];

  return (
    <div className="doc-info-strip">
      <div className="doc-info-container">
        <div className="doc-info-track">
          {duplicatedItems.map((item, index) => {
            const IconComponent = item.icon;
            
            return (
              <div
                key={`${item.text}-${index}`}
                className="doc-info-item"
              >
                <div 
                  className="doc-info-icon-circle"
                  style={{ backgroundColor: item.color }}
                >
                  <IconComponent className="doc-info-icon" />
                </div>
                <span className="doc-info-text">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentSlider;