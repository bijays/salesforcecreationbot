"use strict";

let request = require('request'),
    salesforce = require('./salesforce'),
    formatter = require('./formatter-messenger');

let nforce = require('nforce'),

SF_CLIENT_ID = process.env.SF_CLIENT_ID,
SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
SF_USER_NAME = process.env.SF_USER_NAME,
SF_PASSWORD = process.env.SF_PASSWORD;
var responseJSON ;

function sfConnection() {


    var org = nforce.createConnection({
        clientId: SF_CLIENT_ID,
        clientSecret: SF_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/oauth/_callback',
        mode: 'single',
        autoRefresh: true
    });

    org.authenticate({ username: SF_USER_NAME, password: SF_PASSWORD}, function(err, oauth) {
        if(err) {
            console.error('unable to authenticate to sfdc');
        } else {
            org.apexRest({uri:'/BlockList/', method: 'GET', oauth}, function(err, resp) {
              //console.log(resp);
              if(!err) {
                //console.log(resp);
                responseJSON = resp;
                console.log(response);
                
                //var obj = JSON.parse(response);
                //console.log('Tittle'+obj.title);
                //console.log('buttons'+obj.buttons[0]);
                //res.send(resp);
              }else{
                console.log(err);
                //
                //res.send(err);
              }
            });
        }
    });
}

let sendMessage = (message, recipient) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.FB_PAGE_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipient},
            message: message
        }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

let processText = (text, sender)  => {
    let match;
    match = text.match(/Hi/i);
    if (match) {
        sendMessage({text:
            `Welcome to Creation Technology`}, sender);
        sfConnection();
        salesforce.findBlock(match[1]).then(blocks => {
            sendMessage({text: `Here are the services available`}, sender);
            sendMessage(formatter.formatBlocks(blocks,responseJSON), sender)
        });
        return;
    }

    match = text.match(/search account (.*)/i);
    if (match) {
        salesforce.findAccount(match[1]).then(accounts => {
            sendMessage({text: `Here are the accounts I found matching "${match[1]}":`}, sender);
            sendMessage(formatter.formatAccounts(accounts), sender)
        });
        return;
    }

    match = text.match(/search (.*) in accounts/i);
    if (match) {
        salesforce.findAccount(match[1]).then(accounts => {
            sendMessage({text: `Here are the accounts I found matching "${match[1]}":`}, sender);
            sendMessage(formatter.formatAccounts(accounts), sender)
        });
        return;
    }

    match = text.match(/search contact (.*)/i);
    if (match) {
        salesforce.findContact(match[1]).then(contacts => {
            sendMessage({text: `Here are the contacts I found matching "${match[1]}":`}, sender);
            sendMessage(formatter.formatContacts(contacts), sender)
        });
        return;
    }

    match = text.match(/top (.*) opportunities/i);
    if (match) {
        salesforce.getTopOpportunities(match[1]).then(opportunities => {
            sendMessage({text: `Here are your top ${match[1]} opportunities:`}, sender);
            sendMessage(formatter.formatOpportunities(opportunities), sender)
        });
        return;
    }
};

let handleGet = (req, res) => {
    if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
};

let handlePost = (req, res) => {
    let events = req.body.entry[0].messaging;
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let sender = event.sender.id;
        if (process.env.MAINTENANCE_MODE && ((event.message && event.message.text) || event.postback)) {
            sendMessage({text: `Sorry I'm taking a break right now.`}, sender);
        } else if (event.message && event.message.text) {
            processText(event.message.text, sender);
        } else if (event.postback) {
            let payload = event.postback.payload.split(",");
            if (payload[0] === "view_contacts") {
                sendMessage({text: "OK, looking for your contacts at " + payload[2] + "..."}, sender);
                salesforce.findContactsByAccount(payload[1]).then(contacts => sendMessage(formatter.formatContacts(contacts), sender));
            } else if (payload[0] === "close_won") {
                sendMessage({text: `OK, I closed the opportunity "${payload[2]}" as "Close Won". Way to go Christophe!`}, sender);
            } else if (payload[0] === "close_lost") {
                sendMessage({text: `I'm sorry to hear that. I closed the opportunity "${payload[2]}" as "Close Lost".`}, sender);
            }
        }
    }
    res.sendStatus(200);
};

exports.org = org;
exports.handleGet = handleGet;
exports.handlePost = handlePost;