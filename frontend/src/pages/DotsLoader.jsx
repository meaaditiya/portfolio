import React from 'react';
import '../pagesCSS/DotsLoader.css';

const CircleLoader = () => {
  return (
  <>
  
<section id="global">

    <div id="top" class="mask">
      <div class="plane"></div>
    </div>
    <div id="middle" class="mask">
      <div class="plane"></div>
    </div>

    <div id="bottom" class="mask">
      <div class="plane"></div>
    </div>
    
  <p className='loaderld'><i>LOADING...</i></p>
    
</section>
  </>
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
