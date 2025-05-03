import { model, Schema } from "mongoose";
//=======================================
const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Image: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    nationalID: {
      type: String,
      required: true,
      unique: true,
      minlength: 14,
      maxlength: 14,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    availableDates: {
      type: [
        {
          date: {
            type: Date,
            // required: true,
          },
          fromTime: {
            type: String,
            // required: true,
          },
          toTime: {
            type: String,
            // required: true,
          },
        },
      ],
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10,11}$/, "Please provide a valid phone number"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    history: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["doctor"],
      default: "doctor",
    },
  },
  { timestamps: true, versionKey: false }
);
//============================================
export const doctorModel = model("Doctor", doctorSchema);
