import React, { useState, useEffect } from 'react';
import { ChevronDown} from 'lucide-react';

const FontSizeController = () => {
  const [fontSize, setFontSize] = useState('none');
  
  // Font size multipliers (will multiply current CSS font size)
  const fontSizeMultipliers = {
    'none': null,
    'small': 0.85,
    'medium': 1.15,
    'large': 1.3,
    'x-large': 1.5
  };

  useEffect(() => {
    // Only apply if user has made a selection (not 'none')
    if (fontSize !== 'none') {
      const contentElement = document.querySelector('.blog-post-content');
      if (contentElement) {
        // Set CSS variable instead of directly changing font-size
        contentElement.style.setProperty('--font-size-multiplier', fontSizeMultipliers[fontSize]);
        contentElement.classList.add('font-size-adjusted');
      }
      
      // Save preference to localStorage
      localStorage.setItem('blog-font-size', fontSize);
    } else {
      // Remove any font size adjustments
      const contentElement = document.querySelector('.blog-post-content');
      if (contentElement) {
        contentElement.style.removeProperty('--font-size-multiplier');
        contentElement.classList.remove('font-size-adjusted');
      }
      localStorage.removeItem('blog-font-size');
    }
  }, [fontSize]);

  // Load saved preference on mount
  useEffect(() => {
    const savedSize = localStorage.getItem('blog-font-size');
    if (savedSize && fontSizeMultipliers[savedSize] !== undefined) {
      setFontSize(savedSize);
    }
  }, []);

  return (
    <div className="font-size-controller">
      <div className="btn6 button7 summarybtn">
       
        <select 
          value={fontSize} 
          onChange={(e) => setFontSize(e.target.value)}
          className="font-size-dropdown"
        >
          <option value="small">Small</option>
          <option value="default">Default</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="x-large">Extra Large</option>
        </select>
        
      </div>
    </div>
  );
};

export default FontSizeController;