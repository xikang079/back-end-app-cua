const User = require('../models/user.model'); // Đảm bảo đúng đường dẫn
const AuthError = require('../core/error.response').AuthError;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Đảm bảo rằng bạn đã import jsonwebtoken
const crypto = require('node:crypto');
const KeyTokenModel = require('../models/keytoken.model');

class AuthServices {

    static createUser = async (data) => {
        const findUser = await User.findOne({ username: data.username });
        if (findUser) throw new AuthError("User already exists!");

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(data.password, salt);

        const user = await User.create({
            username: data.username,
            password: hashPassword,
            fullname: data.fullname,
            role: data.role,
            depotName: data.depotName,
            address: data.address,
            phone: data.phone,
        });

        if (!user) throw new AuthError("Create user failed!");

        return { user };
    };

    static login = async ({ username, password }) => {
        const user = await User.findOne({ username: username }).lean();
        if (!user) throw new AuthError("User not found!");
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new AuthError("Password incorrect!", 400);
    
        const publicKey = crypto.randomBytes(32).toString('hex');
        const privateKey = crypto.randomBytes(32).toString('hex');
    
        // Tạo token không có thời hạn hết hạn
        const accessToken = jwt.sign({ id: user._id, role: user.role }, publicKey);
        const refreshToken = jwt.sign({ id: user._id, role: user.role }, privateKey, { expiresIn: '7d' });
    
        // Cập nhật hoặc tạo mới key token cho user
        await KeyTokenModel.findOneAndUpdate(
          { user: user._id },
          { publicKey, privateKey },
          { new: true, upsert: true }
        );
    
        return {
          user,
          accessToken,
          refreshToken
        };
      }

    static async logoutAll(userId) {
        await KeyTokenModel.deleteMany({ user: userId });
    }

    static info = async ({ id }) => {
        return await User.findById(id).select('-password').lean();
    }

    static updateUser = async (user, data) => {
        const userToUpdate = await User.findById(user.id);
        if (!userToUpdate) throw new AuthError("User not found!", 404);

        const fieldsToUpdate = ['phone', 'address', 'fullname'];
        fieldsToUpdate.forEach(field => {
            if (data[field] && userToUpdate[field] !== data[field]) {
                userToUpdate[field] = data[field];
            }
        });

        await userToUpdate.save();

        const updatedUserData = userToUpdate.toObject();
        delete updatedUserData.password;

        return updatedUserData;
    };

    static async requestPasswordReset(email) {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User does not exist with that email.");

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        return token;
    }

    static async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) throw new Error("Password reset token is invalid or has expired.");

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);

        return User.findOneAndUpdate({
            password: hash,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
    }

    static async deleteUser({ id }) {
        return await User.findByIdAndDelete(id);
    }

    static changeUserPassword = async (userId, currentPassword, newPassword) => {
        const user = await User.findById(userId);

        if (!user) {
            throw new AuthError("User not found");
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            throw new AuthError("Current password is incorrect");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashNewPassword = bcrypt.hashSync(newPassword, salt);

        user.password = hashNewPassword;

        await user.save();

        return { status: 'success' };
    };

    static getAllUsers = async () => {
        return await User.find().select('-password').lean();
    }

    static changeUserStatus = async (id, status) => {
        const user = await User.findByIdAndUpdate(id, { $set: { status } }, { new: true }).select('-password').lean();
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

module.exports = AuthServices;
