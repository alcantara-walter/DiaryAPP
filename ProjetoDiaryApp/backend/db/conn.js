const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('DiaryApp', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

try {
    sequelize.authenticate()
    console.log('Successful Connection as 3333')
}catch(err){
    console.log(err)
}

module.exports = sequelize