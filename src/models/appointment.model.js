import { Schema, model } from "mongoose";
//=============================================================
const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    day: { type: String, default: null },
    date: {
      type: String,
      default: null,
    },
    fromTime: {
      type: String,
      required: true,
    },
    toTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["not completed", "completed", "cancelled"],
      default: "not completed",
    },
    notes: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);
//=============================================================
export const appointmentModel = model("Appointment", appointmentSchema);
