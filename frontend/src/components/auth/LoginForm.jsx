import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import authService from '../../services/AuthService.js'; // Add this import for testing
import Input from '../common/Input';
import './LoginForm.css';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/\S+/, 'Mật khẩu không được chứa khoảng trắng'),
});

const LoginForm = ({ onForgotPassword, onRegister }) => {
  const { login, getRoleBasedRedirect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Get the intended destination from location state or use role-based redirect
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoggingIn(true);
    setLoginError('');

    try {
      console.log("Submitting login:", values.username);
        // Use AuthContext login
      const user = await login(values.username, values.password);
      console.log("Login successful:", user);

      // Chuyển hướng dựa vào role_id - match with App.jsx routes exactly
      if (user.role_id === 1) {
        navigate('/admin', { replace: true });
      } else if (user.role_id === 2) {
        navigate('/sales', { replace: true });
      } else if (user.role_id === 3) {
        navigate('/inventory', { replace: true });
      } else if (user.role_id === 4) {
        navigate('/', { replace: true });
      } else if (user.role_id === 5) {
        navigate('/order-manager', { replace: true });
      } else if (user.role_id === 6) {
        navigate('/shipper', { replace: true });
      } else {
        setLoginError('Tài khoản không có quyền truy cập hệ thống.');
      }

    } catch (error) {
      console.error("Login error in form:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error.constructor.name);
      console.error("Error message property:", error.message);
      console.error("Error string:", error.toString());
      
      // Try multiple ways to get the error message
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại sau.';
      
      if (error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      console.log("Final error message to display:", errorMessage);
      setLoginError(errorMessage);
    } finally {
      setIsLoggingIn(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ errors, touched, values, handleChange, handleBlur, isSubmitting }) => (
          <Form className="login-form">
            <h1>Đăng nhập</h1>

            {loginError && <div className="login-error">{loginError}</div>}

            <Input
              type="text"
              id="username"
              label="Tên đăng nhập"
              name="username"
              placeholder="Nhập tên đăng nhập"
              required
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.username}
              touched={touched.username}
              groupId="username-group"
            />

            <Input
              type="password"
              id="password"
              label="Mật khẩu"
              name="password"
              placeholder="Nhập mật khẩu"
              required
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
            />

            <button
              type="submit"
              className="login-button"
              disabled={isLoggingIn || isSubmitting}
            >
              {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <div className="forgot-password-link">
              <button
                type="button"
                className="forgot-password-button"
                onClick={onForgotPassword}
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="register-link">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                className="register-button-link"
                onClick={onRegister}
              >
                Đăng ký
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;