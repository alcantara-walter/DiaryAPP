const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')

//middleware
const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

//rotas
router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.get('/checkuser', AuthController.checkUser)
router.get('/:id', AuthController.getUserById)
router.patch('/edit/:id', verifyToken, imageUpload.single("picture"), AuthController.editUser)

module.exports = router