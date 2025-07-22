import React from 'react';
import logo from '../../assets/img/logo.svg';
import LoginForm from '../../components/auth/LoginForm';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import RegisterForm from '../../components/auth/RegisterForm';
import '../../App.css';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  return (
    <>
      <header className="header-login">
        <div className="logo-container">
          <img src={logo} alt="Nhà sách Cánh Diều" className="logo-login" />
        </div>
      </header>

      <main className="main-content">
        <div className="login-card">
          {path === '/forgot-password' ? (
            <ForgotPasswordForm 
              onBack={() => navigate('/login')}
              onSuccess={() => navigate('/login')}
            />
          ) : path === '/register' ? (
            <RegisterForm onBack={() => navigate('/login')} />
          ) : (
            <LoginForm 
              onForgotPassword={() => navigate('/forgot-password')}
              onRegister={() => navigate('/register')}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default LoginPage;