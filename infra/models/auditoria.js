import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const Auditoria = sequelize.define(
  "auditoria",
  {
    id_auditoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    entidade: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    id_entidade: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    acao: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    valor_anterior: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    valor_novo: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "auditoria",
    timestamps: false,
  },
);

export default Auditoria;
