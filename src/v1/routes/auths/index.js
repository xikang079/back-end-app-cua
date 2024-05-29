"use strict";

const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/auth.controller');
const asyncHandle = require('../../utils/asyncHandle');
const { checkAuthentication, checkIsAdmin } = require('../../middlewares');

// Đăng kí
router.post('/register', asyncHandle(AuthController.registerUser));

// Đăng nhập
router.post('/login', asyncHandle(AuthController.loginUser));

// Đăng xuất
router.post('/logout-all', checkAuthentication, asyncHandle(AuthController.logoutAll));

// Yêu cầu đặt lại mật khẩu
router.post('/request-reset-password', asyncHandle(AuthController.requestPasswordReset));

// Đặt lại mật khẩu
router.post('/reset-password/:token', asyncHandle(AuthController.resetPassword));

// Lấy tất cả người dùng
router.get('/users', checkAuthentication, asyncHandle(AuthController.getAllUsers));

// Thay đổi trạng thái người dùng
router.post('/status/:id', checkAuthentication, checkIsAdmin, asyncHandle(AuthController.changeUserStatus));

// Thay đổi mật khẩu
router.put('/change-password', checkAuthentication, asyncHandle(AuthController.changePassword));

// Lấy thông tin người dùng
router.get('/info', checkAuthentication, asyncHandle(AuthController.info));

// Cập nhật thông tin người dùng
router.put('/update', checkAuthentication, asyncHandle(AuthController.updateUser));

// Xóa người dùng
router.delete('/delete', checkAuthentication, checkIsAdmin, asyncHandle(AuthController.deleteUser));

module.exports = router;
