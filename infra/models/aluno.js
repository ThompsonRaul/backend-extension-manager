import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const Aluno = sequelize.define(
  "aluno",
  {
    id_aluno: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: "usuario", key: "id_usuario" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    curso: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    semestre: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ativo", "inativo", "formado"),
      allowNull: false,
      defaultValue: "ativo",
    },
    horas_acumuladas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    horas_restantes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 350,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "aluno",
    timestamps: true,
    paranoid: true,
  },
);

export default Aluno;
