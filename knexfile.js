const databaseName = 'modern_fret';

module.exports = {
  development: {
    client: 'postgresql',
    connection: `postgres://localhost/modern_fret`,
    migrations: {
      directory: __dirname + '/src/server/db/migrations'
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds'
    }
  }
};
