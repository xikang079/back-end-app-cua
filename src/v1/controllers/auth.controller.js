const AuthService = require('../services/auth.service');
const { CREATED, OK } = require('../core/success.response');
const jwt = require('jsonwebtoken'); // Đảm bảo rằng bạn đã import jsonwebtoken
const KeyTokenModel = require('../models/keytoken.model');

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

    static async checkToken(req, res, next) {
        try {
            const token = req.headers['authorization'].split(' ')[1];
            const userId = req.headers['x-user-id'];

            if (!token || !userId) {
                return res.status(400).json({ message: 'Token or user ID missing' });
            }

            const keyStore = await KeyTokenModel.findOne({ user: userId }).lean();
            if (!keyStore) {
                return res.status(401).json({ message: 'Not found key' });
            }

            jwt.verify(token, keyStore.publicKey, (err, user) => {
                if (err) {
                    return res.status(401).json({ message: 'Invalid token' });
                }
                return res.status(200).json({ message: 'Token is valid' });
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
