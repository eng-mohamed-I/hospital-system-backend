import mongoose from "mongoose";
import { doctorModel } from "../models/doctor.model.js";
import { customAlphabet } from "nanoid";
import cloudinary from "../utilities/cloudinaryConfig.js";
import { departmentModel } from "../models/department.model.js";
import doctorAvailabilityModel from "../models/doctorAvailability.model.js";
import APIFeatures from "../utilities/apiFeatures.js";
import jwt from "jsonwebtoken";
//======================================================
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);

const getAllDoctors = async (req, res) => {
  try {
    const { query } = req;

    const features = new APIFeatures(
      doctorModel.find().populate("department"),
      query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    const total = await features.getTotalCount();
    const results = docs.length;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ totalPages, results, data: docs });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const searchDoctor = async (req, res) => {
  const { query } = req;
  try {
    const features = new APIFeatures(doctorModel.find(), query)
      .search("name")
      .paginate();

    const limit = query.limit || 10;
    const docs = await features.query;
    const totalPages = Math.ceil(docs.length / limit);

    res.status(200).json({ totalPages, results: docs.length, data: docs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error." || error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorModel
      .findById(req.params.id)
      .populate("department");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDoctor = async (req, res) => {
  // Extract data from the request body
  try {
    const {
      name,
      specialization,
      userName,
      nationalID,
      department,
      email,
      phone,
      price,
      password,
      gender,
      dateOfBirth,
      experience,
      history,
    } = req.body;

    const { file } = req;
    const customId = nanoid();
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: `Hospital/Doctors/${customId}`,
    });

    if (department) {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({ message: "Invalid department Id." });
      }

      const foundDepartment = await departmentModel.findById(department);
      if (!foundDepartment) {
        return res.status(400).json({ message: "Department not found." });
      }
    }

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { secure_url, public_id } = uploadResult;

    const doctor = new doctorModel({
      name,
      specialization,
      userName,
      nationalID,
      department,
      email,
      phone,
      price,
      password,
      gender,
      dateOfBirth,
      experience,
      history,
      Image: {
        secure_url,
        public_id,
      },
    });

    await doctor.save();

    res
      .status(200)
      .json({ message: "Doctor created successfully.", data: doctor });
  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
    res.status(500).json({
      message: "An error occurred while adding the doctor.",
      error: error.message,
    });
  }
};

const updateDoctor = async (req, res) => {
  try {
    let { availableDates, Image } = req.body;

    // Check if availableDates is a string and parse it into an array
    if (typeof availableDates === "string") {
      availableDates = JSON.parse(availableDates);
    }

    // Find the existing doctor record
    const doctor = await doctorModel.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if a new image file is uploaded
    if (req.file) {
      // Remove the old image from Cloudinary
      if (doctor.Image && doctor.Image.public_id) {
        await cloudinary.uploader.destroy(doctor.Image.public_id);
      }

      // Upload the new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "doctors",
      });

      // Update the Image object with the new Cloudinary image URL and public ID
      Image = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    } else {
      // Keep the existing image if no new image was uploaded
      Image = doctor.Image;
    }

    // Perform the update with the parsed availableDates and new image
    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, availableDates, Image },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Doctor Updated Successfully", updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDoctorAvailableDate = async (req, res) => {
  try {
    // Validate that the availableDates array exists and follows the new structure
    const { availableDates } = req.body;

    // console.log(req.body);

    if (!availableDates || !Array.isArray(availableDates)) {
      return res.status(400).json({ message: "Invalid availableDates format" });
    }

    // Ensure that each entry in availableDates has 'date', 'fromTime', and 'toTime'
    const isValid = availableDates.every(
      (dateObj) => dateObj.date && dateObj.fromTime && dateObj.toTime
    );

    if (!isValid) {
      return res.status(400).json({
        message:
          "Each available date must have 'date', 'fromTime', and 'toTime'",
      });
    }

    // Find the doctor by ID and update the availableDates
    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      req.params.id,
      { availableDates: req.body.availableDates },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Doctor Updated Successfully",
      updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating available dates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await doctorModel.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // console.log(req.body);

  // Check if the user exists
  const userExsist = await doctorModel.findOne({ email: email });
  if (!userExsist) {
    return res.status(400).json({ message: "Incorrect email" });
  }

  if (userExsist.password !== password) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  // Generate JWT token after successful login
  const token = jwt.sign(
    { email: userExsist.email, id: userExsist._id, role: userExsist.role }, // Use the correct references
    process.env.JWT_SECRET || "Doctor", // Use environment variable for secret
    { expiresIn: "1h" } // Token expiration time
  );

  // Respond with success message, user details, and token
  res.status(200).json({
    message: "Login Success",
    user: userExsist,
    token,
  });
};

const getDoctorsWithAppointments = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).populate({
      path: "appointments.appointID",
      model: "Appointment",
      match: {
        date: { $gte: new Date() },
      },
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors with appointments:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const addDoctorAvailbility = async (req, res) => {
  try {
    const { id } = req.params;
    const { availableDates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor id." });
    }

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const today = new Date();
    const dateMap = new Map();

    for (let i = 0; i < availableDates.length; i++) {
      const { date, fromTime, toTime } = availableDates[i];
      const fullDate = new Date(date);

      if (new Date(fullDate.toDateString()) < new Date(today.toDateString())) {
        return res.status(400).json({ message: `Expired date: ${date}` });
      }

      if (fromTime >= toTime) {
        return res
          .status(400)
          .json({ message: `Invalid time range on ${date}` });
      }

      const key = `${date}-${fromTime}-${toTime}`;
      if (dateMap.has(key)) {
        return res
          .status(400)
          .json({ message: `Duplicated slot: ${date} ${fromTime}-${toTime}` });
      }
      dateMap.set(key, true);
    }

    let doctorAvailability = await doctorAvailabilityModel.findOne({
      doctor: id,
    });
    if (!doctorAvailability) {
      doctorAvailability = new doctorAvailabilityModel({
        doctor: id,
        availableDates,
      });
    } else {
      const existingSlots = new Set(
        doctorAvailability.availableDates.map(
          (slot) => `${slot.date}-${slot.fromTime}-${slot.toTime}`
        )
      );

      for (const slot of availableDates) {
        const key = `${slot.date}-${slot.fromTime}-${slot.toTime}`;
        if (existingSlots.has(key)) {
          return res.status(400).json({
            message: `Time slot already exists: ${slot.date} ${slot.fromTime}-${slot.toTime}`,
          });
        }
      }

      doctorAvailability.availableDates.push(...availableDates);
    }
    await doctorAvailability.save();

    return res.status(200).json({
      message: "Availability added successfully.",
      data: doctorAvailability,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};

const deleteDoctorAvailabilitySlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, fromTime, toTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor id." });
    }

    const doctorAvailability = await doctorAvailabilityModel.findOne({
      doctor: id,
    });
    if (!doctorAvailability) {
      return res
        .status(404)
        .json({ message: "Doctor availability not found." });
    }

    console.log(doctorAvailability);
    const initialLength = doctorAvailability.availableDates.length;

    doctorAvailability.availableDates =
      doctorAvailability.availableDates.filter(
        (slot) =>
          !(
            slot.date === date &&
            slot.fromTime === fromTime &&
            slot.toTime === toTime
          )
      );

    if (doctorAvailability.availableDates.length === initialLength) {
      return res.status(404).json({
        message: `Time slot not found: ${date} ${fromTime}-${toTime}`,
      });
    }

    await doctorAvailability.save();

    return res.status(200).json({
      message: "Time slot deleted successfully.",
      data: doctorAvailability,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error.",
    });
  }
};

const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params; // doctorId

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor id." });
    }

    const doctorAvailability = await doctorAvailabilityModel.findOne({
      doctor: id,
    });

    if (!doctorAvailability) {
      return res
        .status(404)
        .json({ message: "Doctor availability not found." });
    }

    return res.status(200).json({
      message: "Doctor availability fetched successfully.",
      data: doctorAvailability.availableDates,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error.",
    });
  }
};

//======================================================
export {
  createDoctor,
  login,
  getAllDoctors,
  getDoctorById,
  updateDoctorAvailableDate,
  updateDoctor,
  deleteDoctor,
  getDoctorsWithAppointments,
  addDoctorAvailbility,
  deleteDoctorAvailabilitySlot,
  getDoctorAvailability,
  searchDoctor,
};
