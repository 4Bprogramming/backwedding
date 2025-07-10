import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Photos = sequelize.define(
  "photos",
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  folder: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  },
  {
    timestamps: false,
  }
);


