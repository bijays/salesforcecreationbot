"use strict";

let nforce = require('nforce'),


SF_CLIENT_ID = process.env.SF_CLIENT_ID,
SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
SF_USER_NAME = process.env.SF_USER_NAME,
SF_PASSWORD = process.env.SF_PASSWORD;
var response ;
//var oauth1;

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
                response = resp;
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

let formatBlocks = blocks => {
    let elements = [];
    sfConnection();
    //console.log(response);
    blocks.forEach(block =>
        elements.push({
            title: block.get("Name"),
            subtitle: "Would you like to view this",
            "image_url": "",
            "buttons": [{
                "type":"postback",
                "title":"View Exhibitors",
                "payload": "view_contacts," + block.getId() + "," + block.get("Name")
            },{
                "type": "web_url",
                "url": "https://login.salesforce.com/" + block.getId(),
                "title": "View Speakers"
            },
]
            
        })
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

/*
let formatSubBlocks = Subblocks => {
    let elements = [];
    Subblocks.forEach(Subblock =>
        elements.push({
            title: Subblock.get("Name"),
            subtitle: "Would you like to view this",
            "image_url": "",
            "buttons": [{
                "type":"postback",
                "title":"Block 1",
                "payload": "view_contacts," + Subblock.getId() + "," + Subblock.get("Name")
            },{
                "type": "web_url",
                "url": "https://login.salesforce.com/" + Subblock.getId(),
                "title": "Block 2"
            },
            ]
        });
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};*/

let formatAccounts = accounts => {
    let elements = [];
    accounts.forEach(account =>
        elements.push({
            title: account.get("Name"),
            subtitle: account.get("BillingStreet") + ", " + account.get("BillingCity") + " " + account.get("BillingState") + " · " + account.get("Phone"),
            "image_url": account.get("Picture_URL__c"),
            "buttons": [{
                "type":"postback",
                "title":"View Contacts",
                "payload": "view_contacts," + account.getId() + "," + account.get("Name")
            },{
                "type": "web_url",
                "url": "https://login.salesforce.com/" + account.getId(),
                "title": "Open in Salesforce"
            },
]
        })
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

let formatContacts = contacts => {
    let elements = [];
    contacts.forEach(contact => {
        elements.push({
            title: contact.get("Name"),
            subtitle: contact.get("Title") + " at " + contact.get("Account").Name + " · " + contact.get("MobilePhone"),
            "image_url": contact.get("Picture_URL__c"),
            "buttons": [
                {
                    "type": "postback",
                    "title": "View Notes",
                    "payload": "view_notes," + contact.getId() + "," + contact.get("Name")
                },
                {
                    "type": "web_url",
                    "url": "https://login.salesforce.com/" + contact.getId(),
                    "title": "Open in Salesforce"
                }]
        })
    });
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

let formatOpportunities = opportunities => {
    let elements = [];
    opportunities.forEach(opportunity =>
        elements.push({
            title: opportunity.get("Name"),
            subtitle: opportunity.get("Account").Name + " · $" + opportunity.get("Amount"),
            "image_url": "https://s3-us-west-1.amazonaws.com/sfdc-demo/messenger/opportunity500x260.png",
            "buttons": [
                {
                    "type":"postback",
                    "title":"Close Won",
                    "payload": "close_won," + opportunity.getId() + "," + opportunity.get("Name")
                },
                {
                    "type":"postback",
                    "title":"Close Lost",
                    "payload": "close_lost," + opportunity.getId() + "," + opportunity.get("Name")
                },
                {
                    "type": "web_url",
                    "url": "https://login.salesforce.com/" + opportunity.getId(),
                    "title": "Open in Salesforce"
                }]
        })
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

exports.org = org;
exports.formatBlocks = formatBlocks;
//exports.formatSubBlocks = formatSubBlocks;
exports.formatAccounts = formatAccounts;
exports.formatContacts = formatContacts;
exports.formatOpportunities = formatOpportunities;