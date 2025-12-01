import { DataTypes } from "sequelize";
import sequelize from "infra/database.js";

const MembroComissao = sequelize.define(
  "membro_comissao",
  {
    id_membro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: "usuario", key: "id_usuario" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    portaria_designacao: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    funcao: {
      type: DataTypes.ENUM("coordenador", "avaliador", "secretario", "membro"),
      allowNull: false,
      defaultValue: "membro",
    },
    data_inicio: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ativo", "inativo"),
      allowNull: false,
      defaultValue: "ativo",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "membro_comissao",
    timestamps: true,
    paranoid: true,
  },
);

export default MembroComissao;
