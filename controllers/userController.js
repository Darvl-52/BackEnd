import bcrypt from "bcrypt";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const register = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel ({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });

        const user = await doc.save();

        const token = jwt.sign({
                _id: user._id,
            }, 'secret123',
            {
                expiresIn: '30d',
            }
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Не удалось зарегистрироваться',
        });
    }
}
export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email});

        if (!user) {
            return req.status(404).json({
                message: 'Пользователь не найден'
            });
        }
        const isValidPass = await bcrypt.compare(req.body.passwordHash, user._doc.passwordHash);

        if (!isValidPass) {
            return req.status(404).json({
                message: 'Неверный логин или пароль',
            });
        }

        const token = jwt.sign({
                _id: user._id,
            }, 'secret123',
            {
                expiresIn: '30d',
            },
        );

        const {passwordHash, ...userData} = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        });
    }
}
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            })
        }

        const {passwordHash, ...userData} = user._doc;

        res.json(userData);

    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Не удалось найти пользователя',
        })
    }
}