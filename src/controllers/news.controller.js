import { newsModel } from "../models/news.model.js";
//=================================================

const addNewNews = async (req, res, next) => {
  const news = req.body;

  const newData = await newsModel.insertMany(news);

  if (!newData) res.status(400).json({ message: "Error When Add Blog" });

  res.status(201).json({ message: "added", newData });
};

const getAllNews = async (req, res, next) => {
  const news = await newsModel.find();

  if (!news) res.status(404).json({ message: "Didn't Found Any news" });

  res.status(201).json({ message: "news:", news });
};

const getSingleNew = async (req, res, next) => {
  const { id } = req.params;

  const news = await newsModel.findById(id);

  if (!news) res.status(404).json({ message: "Didn't Find news" });

  res.status(201).json({ message: "Done", news });
};

export { addNewNews, getAllNews, getSingleNew };
