const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = "mongodb://localhost:27017/MusicSite";

main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);


}
// const Music = mongoose.Schema;

// const musicSchema = new Music({
//     name: {type: String, required: true, maxLength: 100},
//     album: {type: String, required: true, maxLength: 100},
//     artist: {type: String, required: true, maxLength: 100}
// })

// export default mongoose.model('Music', musicSchema)

