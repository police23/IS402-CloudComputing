import React from 'react';
import PropTypes from 'prop-types';
import './Loading.css';

const Loading = ({ message = 'Đang tải...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
};

Loading.propTypes = {
  message: PropTypes.string
};

export default Loading;