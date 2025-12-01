import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const AtividadeExtensao = sequelize.define(
  "atividade_extensao",
  {
    id_atividade: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    semestre: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    carga_horaria_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "planejada",
        "em_andamento",
        "concluida",
        "cancelada",
      ),
      allowNull: false,
      defaultValue: "planejada",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "createdAt",
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updatedAt",
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "atividade_extensao",
    timestamps: true,
    paranoid: true,
  },
);

export default AtividadeExtensao;
