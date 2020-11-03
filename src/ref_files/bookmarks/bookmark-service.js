'use strict';

const BookmarkService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks');
  },
  insertBookmark(knex, newBookmark) {
    return knex
      .insert(newBookmark)
      .into('bookmarks')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .from('bookmarks')
      .select('*')
      .where('id', id)
      .first();
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks')
      .where({ id })
      .delete()
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  updateBookmark(knex, id, newBookmark) {
    return knex('bookmarks')
      .where({ id })
      .update(newBookmark);
  },
};

module.exports = BookmarkService;
