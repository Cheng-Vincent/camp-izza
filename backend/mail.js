const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        // console.log(client)
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

async function emailYouth(auth, emailTo, emailSubect, emailBody) {
    const options = {
        to: emailTo,
        from: "vcheng@campizza@gmail.com",
        subject: emailSubect,
        html: emailBody,
        attachments: [{
            filename: 'logo.png',
            path: './assets/yss-logo.png',
            cid: 'logo'
        }],
        textEncoding: 'base64',
    };

    const gmail = google.gmail({ version: 'v1', auth });
    var raw = await makeBody(options)
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, function (err, response) {
        if (err) {
            return err;
        }
        else {
            return response;
        }
    });
}

async function makeBody(options) {
    const mailComposer = new MailComposer(options);
    const email = await mailComposer.compile().build();
    var encodedMail = Buffer.from(email).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}

module.exports = { authorize, emailYouth }
