import React from 'react';
import '../pagesCSS/DotsLoader.css';

const CircleLoader = () => {
  return (
    <div className="ultra_super_unique_loader_container_2025">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * 360) / 8;
        return (
          <div
            key={i}
            className="ultra_super_unique_loader_dot_2025"
            style={{
              transform: `rotate(${angle}deg) translate(30px) translateX(-50%)`,
              animationDelay: `${i * 0.125}s`
            }}
          />
        );
      })}
    </div>
  );
};

const App = () => {
  return (
    <div className="ultra_super_unique_app_wrapper_2025">
      <CircleLoader />
    </div>
  );
};

export default App;
