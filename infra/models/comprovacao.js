import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const Comprovacao = sequelize.define(
  "comprovacao",
  {
    id_comprovacao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_participacao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    tipo_documento: {
      type: DataTypes.ENUM("certificado", "declaracao", "outro"),
      allowNull: false,
      defaultValue: "outro",
    },
    caminho_arquivo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    data_envio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    horas_cumpridas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status_aprovacao: {
      type: DataTypes.ENUM("pendente", "aceita", "rejeitada"),
      allowNull: false,
      defaultValue: "pendente",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "comprovacao",
    timestamps: true,
    paranoid: true,
  },
);

export default Comprovacao;
