const mega = require('megajs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const config = require('./config.js');

function generateUA() {
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const versions = ['91.0', '90.0', '89.0', '88.0'];
    const os = ['Windows NT 10.0', 'Macintosh; Intel Mac OS X 10_15_7', 'Linux; Ubuntu 20.04'];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const version = versions[Math.floor(Math.random() * versions.length)];
    const platform = os[Math.floor(Math.random() * os.length)];
    return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${version} Safari/537.36`;
}

const auth = {
    email: config.EMAIL,
    password: config.PASS,
    userAgent: generateUA()
};

const upload = (pth) => {
    return new Promise((resolve, reject) => {
        // Validate file path
        if (!fs.existsSync(pth)) {
            return reject(new Error('The file path does not exist.'));
        }

        const myre = `${crypto.randomBytes(5).toString('hex')}${path.extname(pth)}`;
        const storage = new mega.Storage(auth);

        storage.on('ready', () => {
            let Json;
            try {
                // Validate JSON file
                Json = require(pth);
            } catch (err) {
                return reject(new Error('Invalid JSON file provided.'));
            }

            const Content = Buffer.from(JSON.stringify(Json));
            const size = Buffer.byteLength(Content);

            // Validate file size
            if (size <= 0) {
                return reject(new Error('File size must be greater than zero.'));
            }

            // Log upload options for debugging
            console.log('Upload options:', { name: myre, size });

            const stream = storage.upload({ name: myre, size, allowUploadBuffering: true });
            stream.end(Content);

            stream.on('complete', (file) => {
                // Generate and return file link
                file.link((err, url) => {
                    if (err) {
                        return reject(new Error('Error generating file link: ' + err.message));
                    }
                    resolve(url);
                });
            });

            stream.on('error', (error) => {
                reject(new Error('Error during file upload: ' + error.message));
            });
        });

        storage.on('error', (error) => {
            reject(new Error('Error initializing storage: ' + error.message));
        });
    });
};

module.exports = { upload };
