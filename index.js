import express from "express";
import mongoose from "mongoose";
import multer from  "multer";
import cors from "cors";

import {registerValidation, loginValidation, postCreateValidation} from "./validations.js";
import { checkAuth, handleErrors } from "./utils/index.js";
import { UserController, PostController } from "./controllers/index.js";

mongoose
    .connect('mongodb+srv://admin:qwerty123@blog.nt5pv.mongodb.net/blog?retryWrites=true&w=majority&appName=Blog')
    .then(() => console.log('DB Work'))
    .catch((err) => console.log(err));

const app = express();
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
},
    filename: (_, file, cb)  => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/register', registerValidation, handleErrors, UserController.register);
app.post('/auth/login', loginValidation, handleErrors, UserController.login);
app.get('/auth/me', checkAuth , UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
       url: `/uploads/${req.file.originalname}`,
    });
});

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, handleErrors, PostController.update);

app.listen(4444, (e) => {
    if (e) {
        return console.log(e)
    }
    
    console.log('Server Work')
})