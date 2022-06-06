const express = require('express');
const http = require('http');
const app = express();
const mongodb = require("mongodb");

//check ENV VARS
if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with env var PORT.");
}

if (!process.env.VIDEO_STORAGE_HOST) {
    throw new Error("Please specify the video storage service with env var VIDEO_STORAGE_HOST.");
}

if (!process.env.VIDEO_STORAGE_PORT) {
    throw new Error("Please specify the port number for the video storage service with env var VIDEO_STORAGE_PORT.");
}

if (!process.env.DBHOST) {
    throw new Error("Please specify host for the database service with env var DBHOST.");
}

if (!process.env.DBNAME) {
    throw new Error("Please specify the name for the database service with env var DBNAME.");
}

//set var from ENV
const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = process.env.VIDEO_STORAGE_PORT;
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

console.log(`Forwarding video requests to ${VIDEO_STORAGE_HOST}:${VIDEO_STORAGE_PORT}.`);

function main() {
    return mongodb.MongoClient.connect(DBHOST)
        .then(client => {
            const db = client.db(DBNAME);
            const videosCollection = db.collection("videos");

            app.get('/video', (req, res) => {
                const videoId = new mongodb.ObjectID(req.query.id);
                videosCollection.findOne({ _id: videoId })
                    .then(videoRecord => {
                        if (!videoRecord) {
                            res.sendStatus(400);
                            return;
                        }

                        console.log(`Translated id ${videoId} to path ${videoRecord.videoPath}.`);

                        const forwardRequest = http.request({
                                host: VIDEO_STORAGE_HOST,
                                port: VIDEO_STORAGE_PORT,
                                path: `/video?path=${videoRecord.videoPath}`,
                                method: 'GET',
                                headers: req.headers
                            },
                            forwardResponse => {
                                res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
                                forwardResponse.pipe(res);
                            }
                        );
                        req.pipe(forwardRequest);
                    })
                    .catch(err => {
                        console.error("Database query failed.");
                        console.error(err && err.stack || err);
                        res.sendStatus(500);
                    });
            });
            app.listen(PORT, () => {
                console.log(`Flixster running on port ${PORT}.`);
            });
        });
}

main()
    .then(() => console.log("Service is online"))
    .catch(err => {
        console.error("Service failed to start");
        console.error(err && err.stack || err);
    });