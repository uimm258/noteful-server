/* eslint-disable strict */
const express = require('express');
const ArticlesService = require('./articles-service');
const xss = require('xss');
const articlesRouter = express.Router();
const jsonParser = express.json();


const serializeArticle = article => ({
  id: article.id,
  style: article.style,
  title: xss(article.title),
  content: xss(article.content),
  date_published: article.date_published,
  author: article.author,
});

articlesRouter
  .route('/')
  .get((req, res, next) => {
    ArticlesService.getAllArticles(req.app.get('db'))
      .then((articles) => {
        res.json(articles);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, style, author } = req.body;
    const newArticle = { title, content, style };
    newArticle.author = author;
    ArticlesService.insertArticle(req.app.get('db'), newArticle)
      .then((article) => {
        res.status(201).location(`/articles/${article.id}`).json(article);
      })
      .catch(next);
  });

articlesRouter.route('/:article_id').get((req, res, next) => {
  const knexInstance = req.app.get('db');
  ArticlesService.getById(knexInstance, req.params.article_id)
    .then((article) => {
      if (!article) {
        return res.status(404).json({
          error: { message: 'Article doesn\'t exist' },
        });
      }
      res.json(article);
    })
    .catch(next);
});

module.exports = articlesRouter;
