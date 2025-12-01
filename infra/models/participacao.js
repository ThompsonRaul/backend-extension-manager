import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const Participacao = sequelize.define(
  "participacao",
  {
    id_participacao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_aluno: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_atividade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    horas_validadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status_validacao: {
      type: DataTypes.ENUM("pendente", "aprovada", "reprovada"),
      allowNull: false,
      defaultValue: "pendente",
    },
    relatorios_comprovantes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "participacao",
    timestamps: true,
    paranoid: true,
  },
);

export default Participacao;
