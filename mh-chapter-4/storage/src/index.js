const express = require('express');
const storage = require('azure-storage');
const app = express();

//CHECK ENV VARS
if (!process.env.PORT) {
    throw new Error("Please specify the port number for the Storage Server with env var PORT.");
}

if (!process.env.STORAGE_ACCOUNT_NAME) {
    throw new Error("Please specify the account name for the Storage service with env var STORAGE_ACCOUNT_NAME.");
}

if (!process.env.STORAGE_ACCESS_KEY) {
    throw new Error("Please specify the access key for the Storage service with env var STORAGE_ACCESS_KEY.");
}

//set vars from ENV
const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

//Create the Service
function createBlobService() {
    const blobService = storage.createBlobService(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    return blobService;
}

app.get('/video', (req, res) => {

    const videoPath = req.query.path;
    const blobService = createBlobService();
    const containerName = "videos";

    blobService.getBlobProperties(containerName, videoPath, (err, properties) => {
        if (err) {
            res.sendStatus(500);
            return;
        }
        res.writeHead(200, {
            "Content-Length": properties.contentLength,
            "Content-Type": "video/mp4"
        });
        blobService.getBlobToStream(containerName, videoPath, res, err => {
            if (err) {
                res.sendStatus(500);
                return;
            }
        });
    });

});

app.listen(PORT, () => {
    console.log(`Storage Service running on port ${PORT}.`);
});