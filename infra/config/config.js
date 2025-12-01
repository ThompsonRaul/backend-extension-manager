import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const config = {
  app: {
    env: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
  },

  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || "mariadb",
    name: process.env.MARIADB_DATABASE || "colcic",
    user: process.env.MARIADB_USER || "colcic_user",
    password: process.env.MARIADB_PASSWORD || "colcic_pass",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "default-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
};
