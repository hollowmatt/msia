const express = require("express");

//
// Setup event handlers.
//
function setupHandlers(app, db) {
    const videosCollection = db.collection("videos");
    app.post("/viewed", (req, res) => {
        const videoPath = req.body.videoPath;
        videosCollection
        .insertOne({ videoPath: videoPath })
            .then(() => {
                console.log(`Added video ${videoPath} to history.`);
                res.sendStatus(200);
            })
            .catch(err => {
                console.error(`Error adding video ${videoPath} 
                ➥ to history.`);
                console.error(err && err.stack || err);
                res.sendStatus(500);
            });
    });
}

//
// Start the HTTP server.
//
function startHttpServer() {
    return new Promise(resolve => { // Wrap in a promise so we can be notified when the server has started.
        const app = express();
        setupHandlers(app);
        
        const port = process.env.PORT && parseInt(process.env.PORT) || 3000;
        app.listen(port, () => {
            resolve(); // HTTP server is listening, resolve the promise.
        });
    });
}

//
// Application entry point.
//
function main() {
    console.log("Hello computer!");
    return startHttpServer();
}

main()
    .then(() => console.log("Microservice online."))
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });