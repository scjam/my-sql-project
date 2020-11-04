/* eslint-disable no-console */
const client = require('../lib/client');
const movies = require('./movies.js');
const directors = require('./directors.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();
async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
    
    await Promise.all(
      directors.map(director => {
        return client.query(`
          INSERT INTO directors (name)
          VALUES ($1)
          RETURNING *;
          `,
        [director.name]);
      })
    );
    
    const user = users[0].rows[0];

    await Promise.all(
      movies.map(movie => {
        return client.query(`
                    INSERT INTO movies (name, year_released, best_picture_winner, director_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [movie.name, movie.year_released, movie.best_picture_winner, movie.director_id, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
