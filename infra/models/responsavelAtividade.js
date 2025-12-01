import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const ResponsavelAtividade = sequelize.define(
  "responsavel_atividade",
  {
    id_atividade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "responsavel_atividade",
    timestamps: true,
  },
);

export default ResponsavelAtividade;
