/* eslint-disable strict */
const express = require('express');
const BookmarkService = require('./bookmark-service');
const xss = require('../ref_files/comments/node_modules/xss');

const bookmarksRouter = express.Router();
const jsonParser = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: xss(bookmark.url),
  description: xss(bookmark.description),
  rating: parseInt(xss(bookmark.rating)),
  date_added: bookmark.date_added,
});

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarkService.getAllBookmarks(knexInstance)
      .then((bookmarks) => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookmark = { title, url, description, rating };
    // loops through the required req.body and generates an error message for each key if the value pair is empty
    for (const [key, value] of Object.entries(newBookmark)) {
      // eslint-disable-next-line
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    BookmarkService.insertBookmark(req.app.get('db'), newBookmark)
      .then((bookmark) => {
        res.status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(bookmark);
      })
      .catch(next);
  });

bookmarksRouter
  .route('/:bookmark_id')
  .all((req, res, next) => {
    BookmarkService.getById(
      req.app.get('db'),
      req.params.bookmark_id
    )
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        res.bookmark = bookmark; // save the bookmark for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      id: res.bookmark.id,
      title: xss(res.bookmark.title),
      url: xss(res.bookmark.url),
      description: xss(res.bookmark.description),
      rating: parseInt(xss(res.bookmark.rating)),
      date_added: res.bookmark.date_added,
    });
  })
  .delete((req, res, next) => {
    BookmarkService.deleteBookmark(
      req.app.get('db'),
      req.params.bookmark_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });


module.exports = bookmarksRouter;
