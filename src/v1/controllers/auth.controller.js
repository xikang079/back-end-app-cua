const AuthService = require('../services/auth.service');
const { CREATED, OK } = require('../core/success.response');
// Đảm bảo rằng dòng này tham chiếu đúng tới model user
const User = require('../models/user.model');

class AuthController {
    static registerUser = async (req, res, next) => {
        new CREATED({
            message: "Create user success!",
            metadata: await AuthService.createUser(req.body),
        }).sendData(res);
    }

    static loginUser = async (req, res, next) => {
        const { username, password } = req.body;
        new OK({
            message: "Login success!",
            metadata: await AuthService.login({ username, password }),
        }).sendData(res);
    }

    static async logoutAll(req, res) {
        await AuthService.logoutAll(req.user.id);
        new OK({
            message: "Logged out from all devices successfully!"
        }).sendData(res);
    }

    static info = async (req, res, next) => {
        new OK({
            message: "Get user info success!",
            metadata: await AuthService.info(req.user),
        }).sendData(res);
    }

    static updateUser = async (req, res, next) => {
        new OK({
            message: "Update user success!",
            metadata: await AuthService.updateUser(req.user, req.body),
        }).sendData(res);
    }

    static async requestPasswordReset(req, res) {
        new OK({
            message: "Request password reset success!",
            metadata: await AuthService.requestPasswordReset(req.body.email),
        }).sendData(res);
    }

    static async resetPassword(req, res) {
        new OK({
            message: "Reset password success!",
            metadata: await AuthService.resetPassword(req.params.token, req.body.newPassword)
        }).sendData(res);
    }

    static async deleteUser(req, res) {
        new OK({
            message: "Delete user success!",
            metadata: await AuthService.deleteUser(req.body)
        }).sendData(res);
    }

    static changePassword = async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;

            const result = await AuthService.changeUserPassword(req.user.id, currentPassword, newPassword);

            new OK({
                message: "Password changed successfully!",
                metadata: result,
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    };

    static async getAllUsers(req, res) {
        new OK({
            message: "Get all users success!",
            metadata: await AuthService.getAllUsers()
        }).sendData(res);
    }

    static async changeUserStatus(req, res) {
        new OK({
            message: "Change user status success!",
            metadata: await AuthService.changeUserStatus(req.params.id, req.body.status)
        }).sendData(res);
    }
}

module.exports = AuthController;
