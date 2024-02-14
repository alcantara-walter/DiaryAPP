const express = require('express');
const router = express.Router();

const NotesController = require('../controllers/NotesController');
const Notes = require('../models/Notes');


//middlewares
const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

//routes
router.post('/create', verifyToken, imageUpload.array('images'), NotesController.create);
router.get('/', NotesController.All);
router.get('/mynotes', verifyToken, NotesController.MyNotes);
router.get('/:id', NotesController.GetNotesById);
router.delete('/:id', verifyToken, NotesController.RemoveNotes);
router.patch('/:id', verifyToken, NotesController.UpdateNotes);










module.exports = router;