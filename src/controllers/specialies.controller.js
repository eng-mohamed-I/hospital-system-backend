import { specialiesModel } from "../models/specialtise.model.js";
//======================================================
const createSpecialties = async (req, res, next) => {
  const newData = req.body;

  const specialies = await specialiesModel.insertMany(newData);

  if (!specialies) res.status(400).json({ message: "Faild" });

  res.status(201).json({ message: "Added", specialies });
};
const getAllSpecialties = async (req, res, next) => {
  const specialties = await specialiesModel.find();

  if (!specialties)
    res.status(404).json({ message: "Didn't Found Any specialties" });

  res.status(201).json({ message: "specialties:", specialties });
};
const getSingleSpecialties = async (req, res, next) => {
  const { id } = req.params;

  const speciality = await specialiesModel.findById(id);

  if (!speciality) res.status(404).json({ message: "Didn't Find speciality" });

  res.status(200).json({ message: "Done", speciality });
};
//======================================================
export { createSpecialties, getAllSpecialties, getSingleSpecialties };
