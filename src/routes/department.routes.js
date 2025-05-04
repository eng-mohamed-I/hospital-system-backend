import { Router } from "express";
import { isAdmin } from "../Middleware/Authorization.js";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentDoctors,
  addDepartmentAvailability,
  updateDepartmentAvailability,
  deleteDepartmentAvailability,
  getDepartmentAvailbaility,
  SearchDepartmentAvailability,
} from "../controllers/department.controller.js";
//======================================================
const departmentRoutes = Router();

departmentRoutes.post("/", createDepartment);
departmentRoutes.post("/:id/availability", addDepartmentAvailability);

departmentRoutes.get("/search", SearchDepartmentAvailability);
departmentRoutes.get("/", getAllDepartments);
departmentRoutes.get("/:id", getDepartmentById);
departmentRoutes.get("/:id/doctors", getDepartmentDoctors);
departmentRoutes.get("/:id/availability", getDepartmentAvailbaility);

departmentRoutes.put("/:id", updateDepartment);
departmentRoutes.put("/:id/availability", updateDepartmentAvailability);

departmentRoutes.delete("/:id", deleteDepartment);
departmentRoutes.delete("/:id/availability", deleteDepartmentAvailability);
//======================================================
export default departmentRoutes;
