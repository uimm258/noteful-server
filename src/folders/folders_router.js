/* eslint-disable strict */
const express = require('express');
const FoldersService = require('./folders_service');
const xss = require('xss');
const foldersRouter = express.Router();
const jsonParser = express.json();
const logger = require('../logger');

const serializeFolder = (folder) => ({
  id: folder.id,
  folder_name: xss(folder.folder_name),
});

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knex = req.app.get('db');
    FoldersService.getAllFolders(knex)
      .then((folders) => res.json(folders.map(serializeFolder)))
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    for (const field of ['folder_name']) {
      if (!req.body[field]) {
        logger.error(`The ${field} is missing for the folders post`);
        return res
          .status(400)
          .json({ error: { message: `${field} is missing` } });
      }
    }
    const newFolder = {
      folder_name: xss(req.body.folder_name),
    };
    FoldersService
      .insertFolder(req.app.get('db'), newFolder)
      .then((folder) => {
        logger.info(`folder with id ${folder.id} created`);
        res.status(201).location(`/folders/${folder.id}`).json(folder);
      })
      .catch(next);
  });

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    const { folder_id } = req.params;
    FoldersService.getById(req.app.get('db'), folder_id)
      .then((folder) => {
        if (!folder) {
          logger.error(`The folder with id the ${folder_id} was not found`);
          return res
            .status(404)
            .json({ error: { message: 'folder not found' } });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const folder = res.folder;
    res.json(serializeFolder(folder));
  })
  .delete((req, res, next) => {
    const { folder_id } = req.params;
    FoldersService.deleteFolder(req.app.get('db'), folder_id)
      .then(() => {
        logger.info(`folder with id ${folder_id} has been deleted`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const folderUpdates = req.body;
    // eslint-disable-next-line
    if (Object.keys(folderUpdates).length == 0) {
      logger.info('folder can not be empty');
      return res.status(400).json({
        error: { message: 'patch request must supply values to update' },
      });
    }
    FoldersService
      .updatefolder(
        req.app.get('db'),
        res.folder.id,
        folderUpdates
      ).then((updatedfolder) => {
        logger.info(`The folder with id ${res.folder.id} has been updated`);
        res.status(204).end();
      });
  });

module.exports = foldersRouter;
