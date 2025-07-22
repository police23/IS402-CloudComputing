import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '../common/Input';
import './RegisterForm.css';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/AuthService'; // Khi có API đăng ký thì bỏ comment

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: Yup.string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([Yup.ref('password'), null], 'Mật khẩu xác nhận không khớp'),
  full_name: Yup.string().required('Vui lòng nhập họ tên'),
  email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  phone: Yup.string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^\d{9,11}$/, 'Số điện thoại phải từ 9-11 chữ số'),
  gender: Yup.string().required('Vui lòng chọn giới tính'),
});

const RegisterForm = ({ onSuccess }) => {
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setRegisterError('');
    setRegisterSuccess('');
    setIsRegistering(true);
    try {
      // Map đúng tên trường cho backend
      const payload = {
        username: values.username,
        password: values.password,
        fullName: values.full_name, // backend yêu cầu fullName
        email: values.email,
        phone: values.phone,
        gender:
          values.gender === 'Nam'
            ? 0
            : values.gender === 'Nữ'
            ? 1
            : 2, // 0: Nam, 1: Nữ, 2: Khác
      };
      await authService.register(payload);
      alert('Tạo tài khoản thành công');
      setRegisterSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      resetForm();
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else navigate('/login');
      }, 1500);
    } catch (error) {
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (error && error.message) errorMessage = error.message;
      setRegisterError(errorMessage);
    } finally {
      setIsRegistering(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="register-form-container">
      <Formik
        initialValues={{
          username: '',
          password: '',
          confirmPassword: '',
          full_name: '',
          email: '',
          phone: '',
          gender: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ errors, touched, values, handleChange, handleBlur, isSubmitting }) => (
          <Form className="register-form">
            <h1>Đăng ký tài khoản</h1>
            {registerError && <div className="register-error">{registerError}</div>}
            {registerSuccess && <div className="register-success">{registerSuccess}</div>}
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
              type="text"
              id="full_name"
              label="Họ tên"
              name="full_name"
              placeholder="Nhập họ tên"
              required
              value={values.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.full_name}
              touched={touched.full_name}
            />
            <Input
              type="email"
              id="email"
              label="Email"
              name="email"
              placeholder="Nhập email"
              required
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
            />
            <Input
              type="text"
              id="phone"
              label="Số điện thoại"
              name="phone"
              placeholder="Nhập số điện thoại"
              required
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
            />
            <div className="input-group">
              <label htmlFor="gender">Giới tính <span className="required">*</span></label>
              <select
                id="gender"
                name="gender"
                value={values.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.gender && errors.gender ? 'input-error' : ''}
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
              <div className="error-message">{touched.gender && errors.gender ? errors.gender : '\u00A0'}</div>
            </div>
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
            <Input
              type="password"
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              required
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            />
            <button
              type="submit"
              className="register-button"
              disabled={isRegistering || isSubmitting}
            >
              {isRegistering ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            <div className="login-link">
              Đã có tài khoản?{' '}
              <button
                type="button"
                className="login-button-link"
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterForm;
