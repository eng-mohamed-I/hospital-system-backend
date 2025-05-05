import mongoose from "mongoose";
import { departmentModel } from "../models/department.model.js";
import { doctorModel } from "../models/doctor.model.js";
import departmentAvailabilityModel from "../models/departmentAvailability.model.js";
import APIFeatures from "../utilities/apiFeatures.js";
//==============================================================
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    let foundedDepartment = await departmentModel.findOne({ name: name });
    if (foundedDepartment) {
      return res.status(400).json({ message: "Department already exist." });
    }

    const department = new departmentModel({ name, description });
    await department.save();

    res.status(201).json({
      message: "Department created successfully.",
      data: department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(400).json({ message: error.message });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const { query } = req;

    const features = new APIFeatures(departmentModel.find(), query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    const results = docs.length;
    const total = await features.getTotalCount();
    const totalPages = Math.ceil(total / req.query.limit || 10);

    res.status(200).json({
      total: totalPages,
      results,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const docs = await departmentModel.findById(id);
    if (!docs) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "success", data: docs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchDepartment = async (req, res) => {
  const { query } = req;
  try {
    const features = new APIFeatures(departmentModel.find(), query)
      .search("name")
      .paginate();

    const limit = query.limit || 10;
    const docs = await features.query;
    const totalPages = Math.ceil(docs.length / limit);

    res
      .status(200)
      .json({ total: totalPages, results: docs.length, data: docs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error." || error.message });
  }
};

const updateDepartment = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    let department = await departmentModel.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const departmentExist = await departmentModel.findOne({ name: name });

    if (departmentExist && departmentExist._id.toString() !== id.toString()) {
      return res.status(400).json({ message: "Department already exist" });
    }

    department = await departmentModel
      .findByIdAndUpdate(id, req.body, {
        new: true,
      })
      .populate("doctors");

    res
      .status(200)
      .json({ message: "department updated successfully", department });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Id" });
  }
  try {
    const department = await departmentModel.findByIdAndDelete(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDepartmentDoctors = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id." });
    }
    const department = await departmentModel.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    const departmentDoctors = await doctorModel
      .find({ department: id })
      .select(
        "Image name gender userName specialization price gender phone dateOfBirth experience history"
      )
      .populate("department");

    res.status(200).json({
      message: "Done successfully.",
      data: departmentDoctors,
      results: departmentDoctors.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};
//==============================================================
const SearchDepartmentAvailability = async (req, res) => {
  const { query } = req;
  try {
    const features = new APIFeatures(departmentModel.find(), query)
      .search("name")
      .paginate();

    const departments = await features.query;

    res.status(200).json({
      message: "Departments founded successfully.",
      data: departments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};

const getDepartmentAvailbaility = async (req, res) => {
  const { id } = req.params;

  try {
    const departmentAvailability = await departmentAvailabilityModel
      .findOne({ department: id })
      .populate("department", "name description");

    if (!departmentAvailability) {
      return res.status(404).json({
        message: "The department does not have a booking date available yet.",
      });
    }

    res.status(200).json({
      message: "Get department availability.",
      data: departmentAvailability,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error?.message || "Internal server error." });
  }
};

const addDepartmentAvailability = async (req, res) => {
  const { id } = req.params;
  const { availableDates } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid department id." });
    }

    const department = await departmentModel.findById(id);
    if (!department) {
      return res.status(400).json({ message: "Department not found." });
    }

    // check if any day is duplicated or not
    const seenDays = new Set();
    for (let date of availableDates) {
      const day = date.day.toLowerCase();
      if (seenDays.has(day)) {
        return res
          .status(400)
          .json({ message: `Duplicate day in request: ${date.day}` });
      }
      seenDays.add(day);
    }

    let departmentAvailability = await departmentAvailabilityModel.findOne({
      department: id,
    });

    if (!departmentAvailability) {
      departmentAvailability = new departmentAvailabilityModel({
        department: id,
        availableDates: [],
      });
    }

    // check if any day already exist or not
    const existingDays = new Set(
      departmentAvailability.availableDates.map((d) => d.day.toLowerCase())
    );
    for (let date of availableDates) {
      const day = date.day.toLowerCase();
      if (existingDays.has(day)) {
        return res
          .status(400)
          .json({ message: `Day ${date.day} already exists.` });
      }
    }

    departmentAvailability.availableDates.push(...availableDates);
    await departmentAvailability.save();

    return res.status(201).json({
      message: "Available dates added successfully.",
      data: departmentAvailability,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

const updateDepartmentAvailability = async (req, res) => {
  const { id } = req.params;
  const { day, openTime, closeTime } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid department id." });
    }

    const departmentAvailability = await departmentAvailabilityModel.findOne({
      department: id,
    });

    if (!departmentAvailability) {
      return res
        .status(404)
        .json({ message: "Department availability not found." });
    }

    const dateIndex = departmentAvailability.availableDates.findIndex(
      (d) => d.day.toLowerCase() === day.toLowerCase()
    );

    if (dateIndex === -1) {
      return res
        .status(404)
        .json({ message: `Day ${day} not found in availability.` });
    }

    if (openTime)
      departmentAvailability.availableDates[dateIndex].openTime = openTime;
    if (closeTime)
      departmentAvailability.availableDates[dateIndex].closeTime = closeTime;

    await departmentAvailability.save();

    return res.status(200).json({
      message: `Availability for ${day} updated successfully.`,
      data: departmentAvailability,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

const deleteDepartmentAvailability = async (req, res) => {
  const { id } = req.params;
  const { day } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid department id." });
    }

    const departmentAvailability = await departmentAvailabilityModel.findOne({
      department: id,
    });

    if (!departmentAvailability) {
      return res
        .status(404)
        .json({ message: "Department availability not found." });
    }

    const initialLength = departmentAvailability.availableDates.length;

    departmentAvailability.availableDates =
      departmentAvailability.availableDates.filter(
        (d) => d.day.toLowerCase() !== day.toLowerCase()
      );

    if (departmentAvailability.availableDates.length === initialLength) {
      return res
        .status(404)
        .json({ message: `Day ${day} not found in availability.` });
    }

    await departmentAvailability.save();

    return res.status(200).json({
      message: `Day ${day} deleted successfully from availability.`,
      data: departmentAvailability,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
//==============================================================
export {
  createDepartment,
  getDepartmentAvailbaility,
  searchDepartment,
  addDepartmentAvailability,
  updateDepartmentAvailability,
  SearchDepartmentAvailability,
  deleteDepartmentAvailability,
  getAllDepartments,
  getDepartmentDoctors,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
