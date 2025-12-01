import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const Permissao = sequelize.define(
  "permissao",
  {
    id_permissao: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    acao: {
      type: DataTypes.STRING(100),
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
    tableName: "permissao",
    timestamps: true,
    paranoid: true,
  },
);

export default Permissao;
