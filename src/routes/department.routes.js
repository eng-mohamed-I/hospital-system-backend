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
} from "../controllers/department.controller.js";
//======================================================
const departmentRoutes = Router();

departmentRoutes.post("/", createDepartment);
departmentRoutes.post("/:id/availability", addDepartmentAvailability);
departmentRoutes.put("/:id/availability", updateDepartmentAvailability);
departmentRoutes.delete("/:id/availability", deleteDepartmentAvailability);

departmentRoutes.get("/", getAllDepartments);
departmentRoutes.get("/:id", getDepartmentById);
departmentRoutes.get("/doctors/:id", getDepartmentDoctors);

departmentRoutes.put("/:id", isAdmin, updateDepartment);

departmentRoutes.delete("/:id", isAdmin, deleteDepartment);
//======================================================
export default departmentRoutes;
