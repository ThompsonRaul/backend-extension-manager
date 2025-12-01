import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const Professor = sequelize.define(
  "professor",
  {
    id_professor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: "usuario", key: "id_usuario" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    area: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    departamento: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "professor",
    timestamps: true,
    paranoid: true,
  },
);

export default Professor;
