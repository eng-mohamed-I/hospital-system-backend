import { Router } from "express";
import { isAdmin } from "../Middleware/Authorization.js";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentDoctors,
} from "../controllers/department.controller.js";
//======================================================
const departmentRoutes = Router();

departmentRoutes.get("/", getAllDepartments);
departmentRoutes.post("/", createDepartment);
departmentRoutes.get("/:id", getDepartmentById);
departmentRoutes.get("/doctors/:id", getDepartmentDoctors);
departmentRoutes.put("/:id", isAdmin, updateDepartment);
departmentRoutes.delete("/:id", isAdmin, deleteDepartment);
//======================================================
export default departmentRoutes;
