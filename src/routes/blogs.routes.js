import { Router } from "express";
import { multerCloudFunction } from "../services/multerCloud.js";
import { allowedExtensions } from "../utilities/allowedEtentions.js";
import multer from "multer";
import path from "path";

import {
  addNewBlog,
  deleteBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
} from "../controllers/blogs.controller.js";
import { isAdmin } from "../Middleware/Authorization.js";
//==========================================================
const blogRoutes = Router();

blogRoutes.post(
  "/",
  isAdmin,
  multerCloudFunction(allowedExtensions.Image).single("image"),
  addNewBlog
);
blogRoutes.put(
  "/:id",
  isAdmin,
  multerCloudFunction(allowedExtensions.Image).single("image"),
  updateBlog
);
blogRoutes.delete("/:id", isAdmin, deleteBlog);
blogRoutes.get("/", getAllBlogs);
blogRoutes.get("/:id", getSingleBlog);

export default blogRoutes;
