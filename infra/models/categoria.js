import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const Categoria = sequelize.define(
  "categoria",
  {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_categoria: {
      type: DataTypes.ENUM("Programa", "Projeto", "Curso", "Evento"),
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
    tableName: "categoria",
    timestamps: true,
    paranoid: true,
  },
);

export default Categoria;
