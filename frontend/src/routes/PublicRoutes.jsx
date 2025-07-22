import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import BooksPage from '../pages/BooksPage';
import BookDetailPage from '../pages/BookDetailPage';
import CartPage from '../pages/CartPage';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/book/:id" element={<BookDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  );
};

export default PublicRoutes; 