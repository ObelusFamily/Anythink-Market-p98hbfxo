import React from "react";
import logo from "../../imgs/logo.png";

const Banner = ({ onSearchTextChange }) => {
  return (
    <div className="banner text-white">
      <div className="container p-4 text-center">
        <img src={logo} alt="banner" />
        <div>
          <span>A Place to </span>
          <span id="get-part">get </span>
          <input
            size='30'
            type="text"
            id="search-box"
            placeholder="What is it that you truly desire?"
            onChange={({ target }) => onSearchTextChange(target.value)}
          />
          <span> the cool stuff.</span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
