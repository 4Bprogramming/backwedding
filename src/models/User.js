import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";


export const User = sequelize.define(
  "user",
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  
  },
  {
    timestamps: false,
  }
);

