
import React from 'react';
import '../pagesCSS/PostSkeleton.css';

const SkeletonLoader = () => {
  return (
    <>
<div class="loading2">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>
<div><h3>Loading.... Posts</h3></div>
</>
  );
};

export default SkeletonLoader;
