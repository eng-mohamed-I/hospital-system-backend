import { Router } from "express";
import {
  createSpecialties,
  getAllSpecialties,
  getSingleSpecialties,
} from "../controllers/specialies.controller.js";

//======================================================
const specialiesRoutes = Router();

specialiesRoutes.post("/", createSpecialties);
specialiesRoutes.get("/", getAllSpecialties);
specialiesRoutes.get("/:id", getSingleSpecialties);
//======================================================
export default specialiesRoutes;
