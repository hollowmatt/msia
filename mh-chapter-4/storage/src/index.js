const {Storage} = require('@google-cloud/storage');
const projectId = 'microserve-332121';
const keyFilename = '/Users/hollowmatt/mattreactor-account-keys.json';
const storage = new Storage({projectId, keyFilename});

var bucketName = 'microserve';
var fileName ='SampleVideo_1280x720_1mb.mp4';
var fileRef = storage.bucket(bucketName).file(fileName);

fileRef.exists().then(function(data) {
    console.log("File exists");
});

const config = {
    action: 'read',
    expires: '01-01-2026',
};

fileRef.getSignedUrl(config, function(err, url) {
    if(err) {
        console.error(err);
        return;
    }
    console.log("Url is: " + url);
});