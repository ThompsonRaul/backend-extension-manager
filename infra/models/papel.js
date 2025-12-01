import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const Papel = sequelize.define(
  "papel",
  {
    id_papel: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "papel",
    timestamps: true,
    paranoid: true,
  },
);

export default Papel;
