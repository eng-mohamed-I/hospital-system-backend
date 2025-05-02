import { Router } from "express";
import {
  deletePatient,
  forgetPassword,
  getAllPatients,
  getPatientById,
  resetPassword,
  signin,
  signup,
  updateAdminPatient,
  updateDonation,
  updatePassword,
  updatePatient,
  verifyEmail,
} from "../controllers/patient.controller.js";
//=============================================
const patientRoutes = Router();

patientRoutes.post("/sign-up", signup);
patientRoutes.post("/sign-in", signin);
patientRoutes.get("/verify/:token", verifyEmail);
patientRoutes.post("/forget-password", forgetPassword);
patientRoutes.post("/reset-password/:token", resetPassword);
patientRoutes.post("/update-password/:token", updatePassword);
patientRoutes.get("/", getAllPatients);
patientRoutes.delete("/:id", deletePatient);
patientRoutes.post("/update-patient/:token", updatePatient);
patientRoutes.put("/:id", updateAdminPatient);
patientRoutes.get("/:id", getPatientById);
patientRoutes.post("/updateDonation/:token", updateDonation);
//=============================================
export default patientRoutes;
