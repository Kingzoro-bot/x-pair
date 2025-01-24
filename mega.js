const mega = require('megajs');
const crypto = require('crypto');
const path = require('path');
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
        const myre = `${crypto.randomBytes(5).toString('hex')}${path.extname(pth)}`;
        const storage = new mega.Storage(auth);

        storage.on('ready', () => {
            const Json = require(pth);
            const Content = Buffer.from(JSON.stringify(Json));
            const stream = storage.upload({ name: myre, size: Content.length, allowUploadBuffering: true });
            stream.end(Content);

            stream.on('complete', (file) => {
                file.link((err, url) => {
                    if (err) reject(err);
                    else resolve(url);
                });
            });

            stream.on('error', (error) => {
                reject(error);
            });
        });

        storage.on('error', (error) => {
            reject(error);
        });
    });
};

module.exports = { upload };
