const { DataTypes } = require('sequelize');
const db = require('../db/conn');

const User = require('./User');

const Notes = db.define('Notes', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    public: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
})

Notes.belongsTo(User);
User.hasMany(Notes);

module.exports = Notes;
