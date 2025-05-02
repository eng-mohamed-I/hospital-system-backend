import { server } from "./app.js";
import connectDB from "./config/dbConnection.js";
//===============================================

connectDB();

export default server;
