import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const UsuarioPapel = sequelize.define(
  "usuario_papel",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    id_papel: {
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
    tableName: "usuario_papel",
    timestamps: true,
    paranoid: true,
  },
);

export default UsuarioPapel;
