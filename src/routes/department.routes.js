import { Router } from "express";
import { isAdmin } from "../Middleware/Authorization.js";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
//======================================================
const departmentRoutes = Router();

departmentRoutes.post("/create", isAdmin, createDepartment);
departmentRoutes.get("/", getAllDepartments);
departmentRoutes.get("/:id", getDepartmentById);
departmentRoutes.put("/:id", isAdmin, updateDepartment);
departmentRoutes.delete("/:id", isAdmin, deleteDepartment);
//======================================================
export default departmentRoutes;
