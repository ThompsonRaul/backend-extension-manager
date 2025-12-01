require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

module.exports = {
  development: {
    username: process.env.MARIADB_USER || "colcic_user",
    password: process.env.MARIADB_PASSWORD || "colcic_pass",
    database: process.env.MARIADB_DATABASE || "colcic",
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mariadb",
    logging: false,
  },
  test: {
    username: process.env.MARIADB_USER || "colcic_user",
    password: process.env.MARIADB_PASSWORD || "colcic_pass",
    database: process.env.MARIADB_DATABASE || "colcic_test",
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mariadb",
    logging: false,
  },
  production: {
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mariadb",
    logging: false,
  },
};
