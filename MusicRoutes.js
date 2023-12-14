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
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type');
    console.log("GET");

    const {start, limit} = req.query
    parseInt(start);
    parseInt(limit);


    //Get items
    const items = (await Music.find({}).select('name album artist').limit(limit*1).skip(start-1));
    //Count total items
    const total = await Music.countDocuments();

    const createPagination = (total, start, limit) => {
        return {
            "currentPage": currentPage(total, start, limit),
            "currentItems": currentItems(total, start, limit),
            "totalPages": numberOfPages(total, start, limit),

            "totalItems": total,
            "_links": {
                "first": {
                    "page": 1,
                    "href": `${process.env.BASE_URI}/music/${getFirstQueryString(total, start, limit)}`
                },
                "last": {
                    "page": numberOfPages(total, start, limit),
                    "href": `${process.env.BASE_URI}/music/${getLastQueryString(total, start, limit)}`
                },
                "previous": {
                    "page": itemToPageNumber(total, start, limit, previousPageItem(total, start, limit)),
                    "href": `${process.env.BASE_URI}/music/${getPreviousQueryString(total, start, limit)}`
                },
                "next": {
                    "page": itemToPageNumber(total, start, limit, nextPageItem(total, start, limit)),
                    "href": `${process.env.BASE_URI}/music/${getNextQueryString(total, start, limit)}`
                }
            }
        }
    }
    const pagination = createPagination(total, start, limit);

    try {
        //create representation for collection as requested in assignment
        // items, link, pagination
        let musicCollection = {
            items,
            _links: {
                self: {
                    href: `${process.env.BASE_URI}/music`
                },
                collection: {
                    href: `${process.env.BASE_URI}/music`
                },
            },
            pagination
        }
        res.status(200).json(musicCollection);
    } catch {
        res.status(500).send();
    }
});

//DETAIL route
router.get("/:id", async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type');

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
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.send()
});

//DETAIL OPTIONS ROUTE
router.options("/:id", (req, res) => {
    console.log("OPTIONS");
    res.setHeader("Allow", "GET, PUT, DELETE, OPTIONS");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.send()
});

function currentItems(total, start, limit) {
    if(isNaN(start && limit)) {
        return total;
    } else {
        if((total-start+1)-limit > 0) {
            return limit;
        } else {
            return total - start + 1;
        }

    }
}

function numberOfPages(total, start, limit) {
    if(isNaN(start && limit)) {
        return 1;
    } else {
        return Math.ceil(total / limit);
    }
}

function currentPage(total, start, limit) {
    if(isNaN(start && limit)) {
        return 1;
    } else {
        return Math.ceil(start / limit);
    }
}

function firstPageItem(total, start, limit){
    return 1;
}

function lastPageItem(total, start, limit) {
    if(isNaN(start && limit)) {
        return 1;
    } else {
        return total - (total % limit) - limit + 1;
    }

}

function previousPageItem(total, start, limit) {
    if(isNaN(start && limit)) {
        return 1;
    } else {
        return (currentPage(total, start, limit) - 1) * limit - limit + 1;
    }

}

function nextPageItem(total, start, limit) {
    if(isNaN(start && limit)) {
        return 1;
    } else {
        return (currentPage(total, start, limit) + 1) * limit - limit + 1;
    }

}

function getFirstQueryString(total, start, limit) {
    if(isNaN(start && limit)) {
        return "";
    } else {
        return `?start=${firstPageItem(total, start, limit)}&limit=${limit}`;
    }
}

function getLastQueryString(total, start, limit) {
    if(isNaN(start && limit)) {
        return "";
    } else {
        return `?start=${lastPageItem(total, start, limit)}&limit=${limit}`;
    }
}

function getPreviousQueryString(total, start, limit) {
    if(isNaN(start && limit)) {
        return "";
    } else {
        return `?start=${previousPageItem(total, start, limit)}&limit=${limit}`;
    }
}

function getNextQueryString(total, start, limit) {
    if(isNaN(start && limit)) {
        return "";
    } else {
        return `?start=${nextPageItem(total, start, limit)}&limit=${limit}`;
    }
}

function itemToPageNumber(total, start, limit, MusicNumber) {
    console.log(MusicNumber)
    if(isNaN(start && limit)) {
        return 1;
    } else if(MusicNumber < 0) {
        return 1;
    } else {
        return Math.ceil(MusicNumber/limit);
    }
}

export default router;
