import { Router } from "express";
import userRoutes from "./user.routes.js";
import blogRoutes from "./blogs.routes.js";
import departmentRoutes from "./department.routes.js";
import patientRoutes from "./patient.routes.js";
import newsRoutes from "./news.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import doctorRoutes from "./doctor.routes.js";
import reportRoutes from "./report.routes.js";
import specialiesRoutes from "./specialies.routes.js";
//======================================================
const routes = Router();

routes.use("/auth/users", userRoutes);
routes.use("/auth/patients", patientRoutes);
routes.use("/auth/doctors", doctorRoutes);
routes.use("/blogs", blogRoutes);
routes.use("/news", newsRoutes);

routes.use("/departments", departmentRoutes);
routes.use("/appointments", appointmentRoutes);
routes.use("/reports", reportRoutes);
routes.use("/specialties", specialiesRoutes);
//======================================================
export default routes;
