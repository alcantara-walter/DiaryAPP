const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//helpers
const createUserToken = require('../helpers/auth');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');


module.exports = class AuthController {

    static async register(req, res) {
        const { name, email, password, confirmpassword } = req.body;

        //check if does not complete any field
        if (!name) {
            res.status(422).json({ message: 'Field name required'})
            return
        }

        if (!email) {
            res.status(422).json({ message: 'Field email required'})
            return
        }

        if (!password) {
            res.status(422).json({ message: 'Field password required'})
            return
        }

        if (!confirmpassword) {
            res.status(422).json({ message: 'Field confirmpassword required'})
            return
        }

        if (password !== confirmpassword) {
            res.status(422).json({ message: 'Confirm password and password must be same'})
            return
        }

        //check if user already exists 
        const userExist = await User.findOne( {where: {email: email}} )

        if(userExist) {
            res.status(422).json({
                message: ('Email already registered')
            }) 
            return
        }

        //using bcrypt on password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        //creating a User
        const user = new User ({
            name,
            email,
            password: passwordHash,
        })

        try {
            const newUser = await user.save();
            
            await createUserToken(newUser, req, res) //send to helpers/auth.js 
        } catch (error) {
            res.status(500).json({ message: error})
        }


    }
    
    static async login(req, res) {

        const {email, password} = req.body

        if (!email) {
            res.status(422).json({ message: 'Field email required'})
            return
        }

        if (!password) {
            res.status(422).json({ message: 'Field password required'})
            return
        }

        //check if user exists
        const user = await User.findOne( {where: {email: email}} )

        if(!user) {
            res.status(422).json({
                message: ('Email does not registered')
            }) 
            return
        }

        //check if password is the same as db password
        const checkPassword = await bcrypt.compare( password, user.password )

        if(!checkPassword) {
            res.status(422).json({
                message: ('Invalid Password')
            }) 
            return
        }

        await createUserToken(user, req, res) //send to helpers/auth.js 

    }

    static async checkUser(req, res) {
        
        let currentUser

        if(req.headers.authorization) {

            const token = getToken(req)
            const decoded = jwt.verify(token, 'secret')

            currentUser = await User.findOne( {where: {id: decoded.id}})
            currentUser.password = undefined
            
        } else {
            currentUser = null
        }
        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {
        const id = parseInt(req.params.id);

        if (id != req.params.id) {
            res.status(400).json({
                message: 'Invalid user ID',
            })
            return;
        }

        const user = await User.findOne( {where: {id: id}, attributes: {exclude: ['password']}});

        if (!user) {
            res.status(422).json({
                message: 'User does not found',
            })
            return
        }

        res.status(200).json({ user })
    }

    static async editUser(req, res) {
        const id = parseInt(req.params.id);

        //check if user exists
        const token = getToken(req)
        const user = await getUserByToken(token)


        const {name, email, password, confirmpassword} = req.body;
    

        if(req.file) {
           user.picture = req.file.filename;
        }
        //validation
        if (!name) {
            res.status(422).json({ message: 'Field name required'})
            return
        }

        if (!email) {
            res.status(422).json({ message: 'Field email required'})
            return
        }

        //check if email has already registered
        const userExist = await User.findOne({where: {email: email}})

        if (user.email !== email && userExist) {
            res.status(422).json({
                message: 'Please use other email',
            })
            return
        }

        //update value on object user
        user.email = email;
        user.name = name;

        if (password !== confirmpassword) {
            res.status(422).json({ message: 'Password do not match'})
            return
        } else if(password === confirmpassword && password != null ) {
                //creating password
                const salt = await bcrypt.genSalt(12)
                const passwordHash = await bcrypt.hash(password, salt)

                user.password = passwordHash
        }

        try {
            
            //update data
            const [updatedRows] = await User.update(
                { name: user.name, email: user.email, password: user.password, picture: user.picture},
                { where: { id: user.id } }
            );
            if (updatedRows === 0) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
    
            res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
       

    }
}