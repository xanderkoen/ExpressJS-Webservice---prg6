import express from "express";
import Music from "./Music.js";

const router = express.Router();

//INDEX Middleware
router.get("/",  (req, res, next) => {
    if (req.header("Accept") === "application/json") {
        next();
    } else {
        res.status(415).send();
    }
});

//INDEX route
router.get("/", async (req, res) => {
    console.log("GET");

    try {
        let music = await Music.find();

        //create representation for collection as requested in assignment
        // items, link, pagination
        let musicCollection = {
            items: music,
            _links: {
                self: {
                    href: `${process.env.BASE_URI}/music`
                },
                collection: {
                    href: `${process.env.BASE_URI}/music`
                },
            },
            pagination: "TODO PAGINATION"
        }

        res.json(musicCollection);
    } catch {
        res.status(500).send();
    }
});

//DETAIL route
router.get("/:id", async (req, res) => {
    console.log(`Get->Details for ${req.params.id}`);

        if (await Music.findById(req.params.id) !== null){
            try {
                let music = await Music.findById(req.params.id);
                res.status(200).json(music)
            }catch {
                res.status(500).send();
            }
        }else{
            res.status(404).send()
        }
});

//POST route
//POST Middleware
router.post("/",  (req, res, next) => {
    if (req.header("Content-Type") === "application/json" || req.header("Content-Type") === "application/x-www-form-urlencoded") {
        next();
    }
    else {
        res.status(415).send();
    }
});

//POST to database
router.post("/", async (req, res) => {
    console.log("POST");

    let { name, album, artist } = req.body;

    //check for empty values
    if(!name || !album || !artist) {
        return res.status(400).json("all fields must be entered");
    }

    else {
        //upload to DB
        try {
            const insertMusic = await Music.create({
                name,
                album,
                artist
            })

            res.status(201).json(insertMusic); // Respond with the saved document
        } catch {
            res.status(500).send();
        }
    }
});



//PUT route
//PUT Middleware
router.put("/:id",  (req, res, next) => {
    if (req.header("Content-Type") === "application/json" || req.header("Content-Type") === "application/x-www-form-urlencoded") {
        next();
    }
    else {
        res.status(415).send();
    }
});

//PUT to database
router.put("/:id", async (req, res) => {
    console.log(`PUT->updating : ${req.params.id}`);

    const {name, album, artist} = req.body;

    //check if Music exists
    if (await Music.findById(req.params.id) !== null)
    {
       //Music exists continuing checks
        //check for empty values
        if(name || album || artist) {
            try {
                await Music.findByIdAndUpdate(req.params.id, req.body);
                const newMusic = await Music.findById(req.params.id,
                    {
                        name,
                        album,
                        artist
                    });
                res.status(202).json(newMusic)
            }
            catch{
                res.status(500).send("internal server error");
            }
        }
        else {
            return res.status(400).json("all fields must be entered");
        }
    }
    else
    {
        //Music not found
        res.status(404).send("Music does not exist")
    }
});

//DELETE route
router.delete("/:id", async (req, res) => {
    console.log("DELETE");

    //check if Music exists
    if (await Music.findById(req.params.id) !== null) {
        try {
            await  Music.findByIdAndDelete(req.params.id);
            return res.status(204).json(`Music:${req.params.id} has been deleted`)
        }
        catch{
            res.status(500).send("internal server error");
        }
    }else
    {
        //Music not found
        res.status(404).send("Music does not exist")
    }
});


//OPTIONS ROUTE
router.options("/", (req, res) => {
    console.log("OPTIONS");
    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.send()
});

//DETAIL OPTIONS ROUTE
router.options("/:id", (req, res) => {
    console.log("OPTIONS");
    res.setHeader("Allow", "GET, PUT, DELETE, OPTIONS");
    res.send()
});

export default router;
