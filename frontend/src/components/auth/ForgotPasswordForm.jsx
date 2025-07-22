import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import authService from '../../services/AuthService';
import Input from '../common/Input';
import './ForgotPasswordForm.css';

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .required('Vui lòng nhập email')
    .email('Email không hợp lệ'),
});

const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .required('Vui lòng nhập mã OTP')
    .length(6, 'Mã OTP phải có 6 chữ số')
    .matches(/^\d+$/, 'Mã OTP chỉ được chứa số'),
});

const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(8, 'Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số')
    .matches(/\S+/, 'Mật khẩu không được chứa khoảng trắng')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/, 'Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số'),
  confirmPassword: Yup.string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([Yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp'),
});

const ForgotPasswordForm = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.sendOTP(values.email);
      setEmail(values.email);
      setSuccess(response.message);
      setStep('otp');
    } catch (error) {
      setError(error.message || 'Gửi OTP thất bại');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.verifyOTP(email, values.otp);
      setResetToken(response.resetToken);
      setSuccess(response.message);
      setStep('reset');
    } catch (error) {
      setError(error.message || 'Xác thực OTP thất bại');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.resetPassword(email, values.newPassword, resetToken);
      setSuccess(response.message);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      setError(error.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.sendOTP(email);
      setSuccess(response.message);
    } catch (error) {
      console.log(error.message);
      setError(error.message || 'Gửi lại OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <button 
          type="button" 
          className="back-button"
          onClick={onBack}
        >
          ← Quay lại đăng nhập
        </button>
        <h1>Quên mật khẩu</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {step === 'email' && (
        <Formik
          initialValues={{ email: '' }}
          validationSchema={EmailSchema}
          onSubmit={handleSendOTP}
        >
          {({ errors, touched, values, handleChange, handleBlur, isSubmitting }) => (
            <Form className="forgot-password-form">
              <p className="step-description">
                Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
              </p>
              
              <Input
                type="email"
                id="email"
                label="Email"
                name="email"
                placeholder="Nhập email của bạn"
                required
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
              />

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </Form>
          )}
        </Formik>
      )}

      {step === 'otp' && (
        <Formik
          initialValues={{ otp: '' }}
          validationSchema={OTPSchema}
          onSubmit={handleVerifyOTP}
        >
          {({ errors, touched, values, handleChange, handleBlur, isSubmitting }) => (
            <Form className="forgot-password-form">
              <p className="step-description">
                Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
              </p>
              
              <Input
                type="text"
                id="otp"
                label="Mã OTP"
                name="otp"
                placeholder="Nhập mã OTP 6 chữ số"
                required
                value={values.otp}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.otp}
                touched={touched.otp}
                maxLength={6}
              />

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
              </button>

              <button
                type="button"
                className="resend-button"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Gửi lại mã OTP
              </button>
            </Form>
          )}
        </Formik>
      )}

      {step === 'reset' && (
        <Formik
          initialValues={{ newPassword: '', confirmPassword: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {({ errors, touched, values, handleChange, handleBlur, isSubmitting }) => (
            <Form className="forgot-password-form">
              <p className="step-description">
                Tạo mật khẩu mới cho tài khoản của bạn
              </p>
              
              <Input
                type="password"
                id="newPassword"
                label="Mật khẩu mới"
                name="newPassword"
                placeholder="Nhập mật khẩu mới"
                required
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.newPassword}
                touched={touched.newPassword}
              />

              <Input
                type="password"
                id="confirmPassword"
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                required
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
