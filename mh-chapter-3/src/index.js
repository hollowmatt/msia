const express = require('express');
const fs = require('fs');
const path = require("path");

const app = express();
const port = 3000;

// if (!process.env.PORT) {
//     throw new Error("Please specify the port number for the HTTP server with env var PORT.");
// }
// const PORT = process.env.PORT;
app.get("/", (req, res) => {
    res.redirect('/video');
});

app.get('/video', (req, res) => {

    const videoPath = path.join("./videos", "SampleVideo_1280x720_1mb.mp4");
    fs.stat(videoPath, (err, stats) => {
        if (err) {
            console.error("An error occurred");
            res.sendStatus(500);
            return;
        }

        res.writeHead(200, {
            "Content-Length": stats.size,
            "Content-Type": "video/mp4"
        });
        fs.createReadStream(videoPath).pipe(res);
    });
});

app.listen(port, () => {
    console.log(`Microservice running on port ${port}, point your browser to http://localhost:3000.`);
});