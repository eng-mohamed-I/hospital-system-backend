import Stripe from "stripe";
// import { io } from "../app.js";
import { appointmentModel } from "../models/appointment.model.js";
import { doctorModel } from "../models/doctor.model.js";
import { patientModel } from "../models/patient.model.js";
import { sendSMS } from "../services/sendSMS.js";
import jwt from "jsonwebtoken";
import { reportModel } from "../models/report.model.js";
import mongoose from "mongoose";
import { departmentModel } from "../models/department.model.js";
import departmentAvailabilityModel from "../models/departmentAvailability.model.js";
import doctorAvailabilityModel from "../models/doctorAvailability.model.js";
import { getNextDateOfDay, timeToMinutes } from "../utilities/dateUtils.js";
//==========================================================
const stripe = new Stripe(
  "sk_test_51Q0Stx1BDc3FGejoe8y5l8EKXCy9zylTH6kWjLmWqVUKUsgvbgLi1ZCbotQefcrRxkRlMoAVMfDyGVtAHSUounpY00DVLBjyO3"
);

const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    const appointment = await appointmentModel
      .findById(appointmentID)
      .populate("doctorID", "name specialization")
      .populate("patientID", "name")
      .exec();

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({
      doctorName: appointment.doctorID.name,
      doctorSpecialization: appointment.doctorID.specialization,
      patientName: appointment.patientID.name,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      department: appointment.department,
      status: appointment.status,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { doctor, patient, date, fromTime, toTime, department, day } =
      req.body;

    let finalDate = date;
    let price;

    const existingPatient = await patientModel.findById(patient);
    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const isDoctorBooking = !!doctor;

    if (isDoctorBooking) {
      const existingDoctor = await doctorModel.findById(doctor);
      if (!existingDoctor) {
        return res.status(404).json({ message: "Doctor not found." });
      }

      const conflict = await appointmentModel.findOne({
        doctor,
        date,
        fromTime,
        toTime,
      });

      if (conflict) {
        return res.status(409).json({
          message: "This time slot is already booked for this doctor.",
        });
      }

      const doctorAvailability = await doctorAvailabilityModel.findOne({
        doctor,
        availableDates: {
          $elemMatch: {
            date,
            fromTime,
            toTime,
            isBooked: false,
          },
        },
      });

      if (!doctorAvailability) {
        return res.status(404).json({
          message: "Doctor is not available on this date.",
        });
      }

      price = existingDoctor.price;
    } else {
      const existingDepartment = await departmentModel.findById(department);
      if (!existingDepartment) {
        return res.status(404).json({ message: "Department not found." });
      }

      if (!day) {
        return res
          .status(400)
          .json({ message: "Day is required for department booking." });
      }

      const normalizedDay = day.toLowerCase();
      const nextAvailableDate = getNextDateOfDay(day);
      finalDate = nextAvailableDate;

      const existingAppointment = await appointmentModel.findOne({
        department,
        date: nextAvailableDate,
        day: normalizedDay,
      });

      console.log(existingAppointment);
      const fromMinutes = timeToMinutes(fromTime);
      const toMinutes = timeToMinutes(toTime);

      if (existingAppointment) {
        const appFrom = timeToMinutes(existingAppointment.fromTime);
        const appTo = timeToMinutes(existingAppointment.toTime);

        console.log("form existing", existingAppointment);
        if (fromMinutes < appTo && toMinutes > appFrom) {
          return res.status(409).json({
            message: "This time slot is already booked for this department.",
          });
        }
      }

      const departmentAvailability = await departmentAvailabilityModel.findOne({
        department,
        availableDates: {
          $elemMatch: {
            day: normalizedDay,
            openTime: { $lte: fromTime },
            closeTime: { $gte: toTime },
          },
        },
      });

      if (!departmentAvailability) {
        return res.status(404).json({
          message: "Department is not available on this day or time.",
        });
      }

      price = existingDepartment.price;
    }

    const newAppointment = new appointmentModel({
      patient,
      doctor: doctor || null,
      department: department || null,
      date: finalDate,
      day: day || null,
      fromTime,
      toTime,
      status: "not completed",
      price,
    });

    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      data: savedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentReports = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "invalid id" });
  }

  const reports = await reportModel.find({ appointmentId: id });

  res.status(200).json({ message: "get reports successfully", reports });
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    const { status } = req.body;
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentID,
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    io.emit("appointmentStatusUpdate", {
      patientID: updatedAppointment.patientID,
      status: updatedAppointment.status,
      appointmentID,
    });

    res.status(200).json({
      message: "Appointment status updated",
      appointment: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentsByPatientEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find the patient by email
    const patient = await patientModel.findOne({ email });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find appointments for the patient
    const appointments = await appointmentModel
      .find({ patientID: patient._id })
      .populate("doctorID", "name specialization")
      .exec();

    if (!appointments || appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for this patient" });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addReportToAppointment = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    const report = req.body;

    const appointment = await appointmentModel.findById(appointmentID);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Cannot add report to an incomplete appointment" });
    }

    // Add the report to the appointment
    appointment.report = report;
    await appointment.save();

    res.status(200).json({ message: "Report added successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find()
      .populate("doctorID", "name specialization")
      .populate("patientID", "name")
      .exec();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentID } = req.params;

    const appointment = await appointmentModel.findById(appointmentID);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res
      .status(200)
      .json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDoctorAppointment = async (req, res) => {
  try {
    let { token } = req.params;
    jwt.verify(token, "Doctor", async (error, decoded) => {
      if (error) {
        return res.status(400).json({ message: "invalid token" });
      }
      if (decoded) {
        let { id } = decoded;
        let founded = await appointmentModel
          .find({ doctorID: id })
          .populate("doctorID", "name specialization")
          .populate("patientID", "name")
          .exec();
        return res
          .status(200)
          .json({ message: "founded successfully", appointments: founded });
      }
    });
  } catch (err) {
    res.stauts(500).json({ message: err.message });
  }
};
//==========================================================
export {
  getAppointmentDetails,
  getAppointmentReports,
  bookAppointment,
  updateAppointmentStatus,
  getAppointmentsByPatientEmail,
  addReportToAppointment,
  getAllAppointments,
  cancelAppointment,
  getDoctorAppointment,
};
