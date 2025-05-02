import { Router } from "express";
import {
  addReportToAppointment,
  bookAppointment,
  cancelAppointment,
  getAllAppointments,
  getAppointmentDetails,
  getAppointmentReports,
  getAppointmentsByPatientEmail,
  getDoctorAppointment,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";
//=====================================================

const appointmentRoutes = Router();

appointmentRoutes.get("/:appointmentID", getAppointmentDetails);
appointmentRoutes.post("/book", bookAppointment);
appointmentRoutes.patch("/:appointmentID/status", updateAppointmentStatus);
appointmentRoutes.patch("/:appointmentID/report", addReportToAppointment);
appointmentRoutes.get("/patient/:email", getAppointmentsByPatientEmail);
appointmentRoutes.delete("/cancel/:appointmentID", cancelAppointment);
appointmentRoutes.get("/", getAllAppointments);
appointmentRoutes.get("/doctor/:token", getDoctorAppointment);
appointmentRoutes.get("/reports/:id", getAppointmentReports);
//=====================================================
export default appointmentRoutes;
