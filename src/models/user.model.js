import { Schema, model } from "mongoose";
import pkg from "bcrypt";
//=======================================
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin"],
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    profilePicture: {
      secure_url: { type: String, default: null },
      public_id: { type: String, default: null },
    },
    gender: {
      type: String,
      default: "not specified",
      enum: ["male", "female", "not specified"],
    },
    age: Number,
    token: String,
    forgetCode: String,
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  this.password = pkg.hashSync(this.password, +process.env.SALT_ROUNDS);
});
//=======================================
export const userModel = model("user", userSchema);
