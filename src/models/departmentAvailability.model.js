import { model, Schema } from "mongoose";
//===================================================
const availableDatesSchema = new Schema(
  {
    day: {
      type: String,
      enum: [
        "saturday",
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "hursday",
        "friday",
      ],
      required: true,
    },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
  },
  { _id: false }
);

const departmentdeleteAvailabilitySchema = new Schema(
  {
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      unique: true,
      required: true,
    },
    availableDates: [availableDatesSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const departmentAvailabilityModel = model(
  "DepartmentAvailability",
  departmentdeleteAvailabilitySchema
);
//===================================================

export default departmentAvailabilityModel;
