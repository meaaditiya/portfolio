import React from 'react';
import { Twitter, Facebook, Linkedin, Globe } from 'lucide-react';
import '../pagesCSS/Slider.css';

const SocialSlider = ({ socialEmbeds, onEmbedClick }) => {
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter':
        return Twitter;
      case 'facebook':
        return Facebook;
      case 'linkedin':
        return Linkedin;
      default:
        return Globe;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'twitter':
        return '#1DA1F2';
      case 'facebook':
        return '#4267B2';
      case 'linkedin':
        return '#0077B5';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Duplicate embeds for seamless loop
  const duplicatedEmbeds = [...socialEmbeds, ...socialEmbeds];

  return (
    <div className="slider-wrapper">
      <div className="slider-container-custom">
        <div className="slider-track-custom">
          {duplicatedEmbeds.map((embed, index) => {
            const PlatformIcon = getPlatformIcon(embed.platform);
            const platformColor = getPlatformColor(embed.platform);

            return (
              <div
                key={`${embed._id}-${index}`}
                className="slider-item"
                onClick={() => onEmbedClick(embed)}
              >
                <div className="slider-card slider-social-card">
                  <div className="slider-social-content">
                    <div className="slider-social-watermark">
                      <PlatformIcon 
                        className="slider-watermark-icon" 
                        style={{ color: platformColor, opacity: 0.08 }}
                      />
                    </div>
                    <h4 className="slider-social-title">
                      {embed.title?.length > 80
                        ? embed.title.substring(0, 80) + '...'
                        : embed.title}
                    </h4>
                    {embed.description && (
                      <p className="slider-social-description">
                        {embed.description?.length > 100
                          ? embed.description.substring(0, 100) + '...'
                          : embed.description}
                      </p>
                    )}
                  </div>
                  <div className="slider-overlay">
                    <span className="slider-view-text">Click to view post</span>
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

export default SocialSlider;