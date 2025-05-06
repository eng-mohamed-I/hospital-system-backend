import { Schema, model } from "mongoose";
//============================================
const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Department name must be at least 3 characters long"],
    },
    description: {
      required: true,
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);
//============================================
export const departmentModel = model("Department", departmentSchema);
