import express from "express";
import mongoose from "mongoose";
import MusicRouter from "./MusicRoutes.js";

//Load env
import dotenv from 'dotenv';

dotenv.config();

//setup default mongoose connection
const mongoDB = "mongodb://127.0.0.1:27017/music";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//get default connection
const db = mongoose.connection

//bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//create webserver
const app = express();

//bodyparser midddleware to parse x-form-www-urlencoded
app.use(express.urlencoded({
    extended: false
}));
//bodyparser midddleware to parse json data
app.use(express.json());

//----------------------------------------------------------------------------------------------------------------------

app.use('/music', MusicRouter);

app.get('/', (req, res) => {
    res.send("Webservice music, gebruik /music")
})

const port = process.env.port || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} at http://localhost:${port}`);
});
