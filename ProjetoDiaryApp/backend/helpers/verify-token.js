const jwt = require('jsonwebtoken');
const getToken = require('./get-token')

//middleware validate token
const checkToken = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(401).json({
            message: 'Cannot access!'
        })
    }
    
    const token = getToken(req)

    if (!token) {
        return res.status(401).json({
            message: 'Cannot access!'
        })
    }

    try {
        const verified = jwt.verify(token, 'secret')
        req.user = verified
        next()
    } catch (err) {
        return res.status(400).json({
            message: 'Invalid Token'
        })
    }
}

module.exports = checkToken