/* eslint-disable strict */
const express = require('express');
const NotesService = require('./notes-service');
const xss = require('xss');
const notesRouter = express.Router();
const jsonParser = express.json();
const logger = require('../logger');

const serializeNote = (note) => ({
  id: note.id,
  note_name: xss(note.name),
  content: xss(note.content),
  date_added: note.date,
  folder_id: note.folder_id,
});

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knex = req.app.get('db');
    NotesService
      .getAllNotes(knex)
      .then((notes) => res.json(notes.map(serializeNote)))
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    for (const field of ['id', 'note_name', 'content', 'date_added', 'folder_id']) {
      if (!req.body[field]) {
        logger.error(`${field} is missing from notes post`);
        return res
          .status(400)
          .json({ error: { message: `${field} is missing` } });
      }
    }
    const newNote = {
      id: req.body.id,
      note_name: xss(req.body.title),
      content: xss(req.body.content),
      date_added: req.body.date_added,
      folder_id: req.body.folder_id,
    };
    NotesService
      .addNote(req.app.get('db'), newNote)
      .then((note) => {
        console.log('note', note);
        logger.info(`note with id ${note.id} created`);
        res.status(201).location(`/notes/${note.id}`).json(note);
      })
      .catch(next);
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const { note_id } = req.params;
    NotesService
      .getNoteById(req.app.get('db'), note_id)
      .then((note) => {
        if (!note) {
          logger.error(`Note with id ${note_id} not found`);
          return res.status(404).json({ error: { message: 'Note not found' } });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const note = res.note;
    res.json(serializeNote(note));
  })
  .delete((req, res, next) => {
    const { note_id } = req.params;
    NotesService
      .deleteNote(req.app.get('db'), note_id)
      .then(() => {
        logger.info(`note with id ${note_id} deleted`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const noteUpdates = req.body;
    console.log('noteupdates', noteUpdates);
    if (Object.keys(noteUpdates).length == 0) {
      logger.info('note must have values to update');
      return res.status(400).json({
        error: { message: 'patch request must supply values' },
      });
    }
    NotesService
      .updateNote(req.app.get('db'), res.note.id, noteUpdates)
      .then((updatedNote) => {
        logger.info(`note with id ${res.note.id} updated`);
        res.status(204).end();
      });
  });

module.exports = notesRouter;