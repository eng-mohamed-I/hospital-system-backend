import { Schema, model } from "mongoose";
//================================================
const availableDatesSchema = new Schema(
  {
    date: { type: String, required: true },
    fromTime: { type: String, required: true },
    toTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { _id: false }
);

const doctorAvailabilitySchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },
    availableDates: [availableDatesSchema],
  },
  { timestamps: true }
);

const doctorAvailabilityModel = model(
  "DoctorAvailability",
  doctorAvailabilitySchema
);
//================================================

export default doctorAvailabilityModel;
