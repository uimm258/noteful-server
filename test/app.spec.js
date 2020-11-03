'use strict';

const app = require('../src/app');

describe('App', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    // eslint-disable-next-line no-undef
    return supertest(app).get('/').expect(200, 'Hello, world!');
  });
});


