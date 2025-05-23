import express from "express";
import {
  addReport,
  getOneReport,
  getReports,
} from "../controllers/report.controller.js";
//======================================================
const reportRoutes = express.Router();

reportRoutes.post("/", addReport);
reportRoutes.get("/", getReports);
reportRoutes.get("/:id", getOneReport);
//======================================================
export default reportRoutes;
