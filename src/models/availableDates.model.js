import { Schema, model } from "mongoose";
//=========================================
const slotSchema = new Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
});

const availableDaySchema = new Schema({
  day: {
    type: String,
    enum: [
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
    ],
    required: true,
  },
  slots: [slotSchema],
});

const availableDateSchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },
    availableDays: [availableDaySchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
//=========================================
export const availableDateModel = model("AvailableDate", availableDateSchema);
