require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      // eslint-disable-next-line no-unused-vars
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns movies', async() => {

      const expectation = [
        {
          'id': 1,
          'name': 'Titanic',
          'year_released': 1997,
          'best_picture_winner': true,
          'director': 'James Cameron',
          'owner_id': 1
        },
        {
          'id': 2,
          'name': 'The English Patient',
          'year_released': 1996,
          'best_picture_winner': true,
          'director': 'Anthony Minghella',
          'owner_id': 1
        },
        {
          'id': 3,
          'name': 'The Silence of the Lambs',
          'year_released': 1991,
          'best_picture_winner': true,
          'director': 'Jonathan Demme',
          'owner_id': 1
        },
        {
          'id': 4,
          'name': 'Pulp Fiction',
          'year_released': 1994,
          'best_picture_winner': false,
          'director': 'Quentin Tarantino',
          'owner_id': 1
        },
        {
          'id': 5,
          'name': 'The Green Mile',
          'year_released': 1999,
          'best_picture_winner': false,
          'director': 'Frank Darabont',
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/movies')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single movie', async() => {
      const expectation = {
        id: 1,
        name: 'Titanic',
        year_released: 1997,
        best_picture_winner: true,
        director: 'James Cameron',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/movies/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds a movie to the database and returns it', async() => {
      const expectation = {
        id: 6,
        name: 'Boogie Nights',
        year_released: 1997,
        best_picture_winner: false,
        director: 'Paul Thomas Anderson',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/movies')
        .send({
          name: 'Boogie Nights',
          year_released: 1997,
          best_picture_winner: false,
          director: 'Paul Thomas Anderson',
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allMovies = await fakeRequest(app)
        .get('/movies')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allMovies.body.length).toEqual(6);
    });
  });
});
