/* eslint-disable strict */
const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeArticlesArray } = require('./articles.fixtures');
const { makeUsersArray } = require('./users.fixtures');



describe.only('Articles Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () =>
    db.raw(
      'TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'
    )
  );

  afterEach('cleanup', () =>
    db.raw(
      'TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'
    )
  );
    
  describe('GET /articles', () => {
    context('Given no articles', () => {
      it('responds with 200 and an empty list', () => {
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get('/articles')
          .expect(200, []);
      });
    });

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db.into('blogful_articles').insert(testArticles);
      });

      it('responds with 200 and all of the articles', () => {
        // eslint-disable-next-line no-undef
        return supertest(app).get('/articles').expect(200, testArticles);
      });
    });
  });

  describe('GET /articles/:article_id', () => {
    context('Given no articles', () => {
      it('responds with 404', () => {
        const articleId = 123456;
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get(`/articles/${articleId}`)
          .expect(404, { error: { message: 'Article doesn\'t exist' } });
      });
    });



    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db.into('blogful_articles').insert(testArticles);
      });

      it('responds with 200 and the specified article', () => {
        const articleId = 2;
        const expectedArticle = testArticles[articleId - 1];
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get(`/articles/${articleId}`)
          .expect(200, expectedArticle);
      });
    });
  });
});