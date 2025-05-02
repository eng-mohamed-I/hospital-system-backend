import mongoose from "mongoose";
import { reportModel } from "../models/report.model.js";
// import { io } from "../../../app.js";
//======================================================

let addReport = async (req, res) => {
  try {
    const {
      appointmentId,
      patientName,
      doctorName,
      department,
      doctorComment,
      treatmentPrescription,
      patientAddress,
      patientPhoneNumber,
      followUpRecommendations,
    } = req.body;

    // // Fetch the corresponding documents
    // const patient = await patientModel.findOne({ name: patientName });
    // const doctor = await doctorModel.findOne({ name: doctorName });
    // const dept = await departmentModel.findOne({ name: department });
    // // Check if patient, doctor, or department exist
    // if (!patient || !doctor || !dept) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid patient, doctor, or department name." });
    // }

    // Create a new report instance with ObjectId references
    let report = new reportModel({
      appointmentId,
      patientName,
      doctorName,
      department,
      doctorComment,
      treatmentPrescription,
      patientAddress,
      patientPhoneNumber,
      followUpRecommendations,
    });

    // Save the report
    await report.save();
    // io.emit("newReport", report);

    return res
      .status(201)
      .json({ message: "Report created successfully", report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

let getReports = async (req, res) => {
  try {
    // Fetch reports and populate doctorName and patientName fields
    let reports = await reportModel
      .find()
      // .populate('patientName', 'name')  // Populate patient name
      // .populate('doctorName', 'name');   // Populate doctor name
      .populate("appointmentId");

    res
      .status(200)
      .json({ message: "Reports retrieved successfully", reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

let getOneReport = async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  let report = await reportModel.findById(id);
  if (!report) {
    return res.status(404).json({ message: "report not found" });
  }

  return res
    .status(200)
    .json({ message: "report found successfully", report: report });
};


//======================================================
export { addReport, getReports, getOneReport };
