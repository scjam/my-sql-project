const client = require('../lib/client');
// import our seed data:
const movies = require('./movies.js');
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
      
    const user = users[0].rows[0];

    await Promise.all(
      movies.map(movie => {
        return client.query(`
                    INSERT INTO movies (name, year_released, best_picture_winner, director, owner_id)
                    VALUES ($1, $2, $3, $4);
                `,
        [movie.name, movie.year_released, movie.best_picture_winner, movie.director, user.id]);
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
