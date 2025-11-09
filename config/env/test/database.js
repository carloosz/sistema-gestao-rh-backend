module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('TEST_DATABASE_HOST', '127.0.0.1'),
      port: env.int('TEST_DATABASE_PORT', 5432),
      database: env('TEST_DATABASE_NAME', 'strapi_db'),
      user: env('TEST_DATABASE_USERNAME', 'postgres'),
      password: env('TEST_DATABASE_PASSWORD', 'minhasenha123'),
      ssl: false,
    },
    debug: false,
  },
});
