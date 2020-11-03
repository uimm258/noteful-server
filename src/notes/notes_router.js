/* eslint-disable strict */
const express = require('express');
const NotesService = require('./notes-service');
const xss = require('xss');
const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = (note) => ({
  id: note.id,
  note_name: xss(note.name),
  content: xss(note.content),
  date_added: note.date,
  folder_id: note.folder,
});

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then((notes) => {
        res.json(notes);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, note_name, content, date_added, folder_id } = req.body;
    const newNote = { title, note_name, content, date_added, folder_id };
    NotesService.insertNote(req.app.get('db'), newNote)
      .then((note) => {
        res.status(201).location(`/notes/${note.id}`).json(note);
      })
      .catch(next);
  });

notesRouter.route('/:note_id').get((req, res, next) => {
  const knexInstance = req.app.get('db');
  NotesService.getById(knexInstance, req.params.note_id)
    .then((note) => {
      if (!note) {
        return res.status(404).json({
          error: { message: 'Note doesn\'t exist' },
        });
      }
      res.json(note);
    })
    .catch(next);
});

module.exports = notesRouter;
