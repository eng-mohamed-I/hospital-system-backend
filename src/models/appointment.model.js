import { Schema, model } from "mongoose";
//=============================================================
const appointmentSchema = new Schema(
  {
    patientID: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    departmentID: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    doctorID: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    date: {
      type: Date,
      required: true,
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
    },
  },
  { timestamps: true, versionKey: false }
);
//=============================================================

export const appointmentModel = model("Appointment", appointmentSchema);
