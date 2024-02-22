import '../../App.css';
import React, { useState } from 'react';
import './Trending.css';

const Trending = () => {
  const [popularItems, setPopularItems] = useState([
    { name: 'Item 1     ', likes: 10 },
    { name: 'Item 2     ', likes: 15 },
    { name: 'Item 3     ', likes: 20 },
    { name: 'Item 4     ', likes: 25 },
    { name: 'Item 5     ', likes: 30 }
  ]);

  return (
    <div className="trending-container">
      <h1 className='trending'>WHAT'S TRENDING</h1>
      <div className="popular-items">
        {popularItems.map((item, index) => (
          <div className="item" key={index}>
            <span className="item-name">{item.name}</span>
            <span className="item-likes">
              <i className="fas fa-heart"></i> {item.likes}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;