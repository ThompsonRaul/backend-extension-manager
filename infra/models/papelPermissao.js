import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const PapelPermissao = sequelize.define(
  "papel_permissao",
  {
    id_papel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    id_permissao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "papel_permissao",
    timestamps: true,
    paranoid: true,
  },
);

export default PapelPermissao;
