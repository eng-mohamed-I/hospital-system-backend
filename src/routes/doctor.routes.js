import { Router } from "express";
import { multerCloudFunction } from "../services/multerCloud.js";
import { allowedExtensions } from "../utilities/allowedEtentions.js";
import {
  addDoctorAvailbility,
  createDoctor,
  deleteDoctor,
  deleteDoctorAvailabilitySlot,
  getAllDoctors,
  getDoctorAvailability,
  getDoctorById,
  getDoctorsWithAppointments,
  login,
  searchDoctor,
  updateDoctor,
  updateDoctorAvailableDate,
} from "../controllers/doctor.controller.js";
//======================================================
const doctorRoutes = Router();

doctorRoutes.post(
  "/auth",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  createDoctor
);
doctorRoutes.post("/login", login);
doctorRoutes.post("/:id/availability", addDoctorAvailbility);

doctorRoutes.get("/", getAllDoctors);
doctorRoutes.get("/search", searchDoctor);
doctorRoutes.get("/:id", getDoctorById);
doctorRoutes.get("/appoint", getDoctorsWithAppointments);
doctorRoutes.get("/:id/availability", getDoctorAvailability);

doctorRoutes.put("/A/:id", updateDoctorAvailableDate);
doctorRoutes.put(
  "/:id",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  updateDoctor
);

doctorRoutes.delete("/:id", deleteDoctor);
doctorRoutes.delete("/:id/availability", deleteDoctorAvailabilitySlot);
//======================================================
export default doctorRoutes;
