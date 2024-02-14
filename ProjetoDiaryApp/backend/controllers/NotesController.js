const Notes = require ('../models/Notes');
const User = require('../models/User');


const { Op, where } = require('sequelize');

//helpers
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class NotesController {

    //create a note
    static async create(req, res) {

        const {title, description} = req.body;
        let isPublic = req.body.public;

        if (!title) {
            res.status(422).json({message: "Title must be complete"})
            return
        }

        if (!description) {
            res.status(422).json({message: "Description must be complete"})
            return
        }

        isPublic = isPublic === false ? 0 : 1;

        //get notes owner
        const token = getToken(req)
        const user = await getUserByToken(token)


        //new note
        const notes = new Notes({
            title,
            description,
            public: isPublic,
            UserId: user.id
           
         })
         
         try {
            const newNotes = await notes.save()
            res.status(201).json({
                message: "Note save successful",
                newNotes,
            })
         } catch (error) {
            res.status(500).json({message: error})
         }
         
        
    }

    static async All (req, res) {

        let search = '';
        let order = 'DESC';

        if (req.query.search) {
            search = req.query.search
        }

        if (req.query.order === 'old') {
            order = 'ASC'
        } else {
            order = 'DESC'
        }

        const notes = await Notes.findAll({
            include: User,
            where: {
                title:{[Op.like]: `%${search}%`},
            },
            order: [['createdAt', order]],
          });
       

        const notesSearch = notes.map((result) => result.dataValues)

        let notesFound = notesSearch.length;

        if (notesFound === 0) {
            notesFound = true;
        }

        console.log(notesSearch)

        res.status(200).json({
            notes: notes, search, order, notesFound, notesSearch
        })

    }

    static async MyNotes (req, res) {
        const token = getToken(req);
        const user = await getUserByToken(token)
        let order = 'DESC'

        const notes = await Notes.findAll({
            include: User,
            where: {
                UserId: user.id,
            },
            order: [['createdAt', order]],
        })

        res.status(200).json({
            notes,
        })
    }

    static async GetNotesById (req, res) {
        const id = req.params.id;

        //check if id is valid;
        if (id != req.params.id) {
            res.status(422).json({ message: 'Page not found!'})
            return
        }

        //check if notes exists
        const notes = await Notes.findOne({where: {id: id }})
        if (!notes) {
            res.status(404).json({message: 'Page not found!'})
        }

        res.status(200).json({
            notes: notes,
        })
    }

    static async RemoveNotes (req, res) {
        const token = getToken(req);
        const user = await getUserByToken(token)
        const id = req.params.id;

        //check if id is valid;
        if (!Number.isInteger(Number(id))) {
            res.status(400).json({ message: 'Invalid ID' });
            return
          }

         const noteToDelete = await Notes.findOne({
            where: {
                id: id,
                UserId : user.id
            }
         }) 


         //if you try to delete a note that is not yours res.status(404);
         if (!noteToDelete) {
            res.status(404).json({message: "Note not found"})
            return
         }

         //delete if the note is yours;
         await noteToDelete.destroy();

         res.status(200).json({
            message: "Note successfully deleted!"
        })
        

    }
    
    static async UpdateNotes (req, res) {
        const id = req.params.id;
        const title = req.body.title;
        const description = req.body.description;
        console.log('Dados recebidos no backend:', req.body);
        
        
        const token = getToken(req);
        const user = await getUserByToken(token)
        
        const notes = await Notes.findOne({
            where: {
                id: id,
                UserId: user.id
            }
         }) 

         
         
         //if you try to update a note that is not yours res.status(404);
         if (!notes) {
            res.status(404).json({message: "Note not found"})
            return
         } 
         
         //update if the note is yours;
         await Notes.update(
            {
                title: title || notes.title,
                description: description || notes.description}, {where: {id: id, UserId: user.id}});
            
         res.status(200).json({
            message: "Note successfully updated!"
        })


    }
}