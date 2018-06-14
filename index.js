require('console-stamp')(console, {
    colors: {
        stamp: 'yellow',
        label: 'cyan',
        label: true,
        metadata: 'green'
    }
});

const Discord = require("discord.js");
const fs = require('fs');
const client = new Discord.Client();

const http = require('http');
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');

const app = express();
app.server = http.createServer(app);

let guild = null;
let availableRoles = [];

function init(config) {

    /* Database Setup */
    let db = require('knex')({
        client: 'sqlite3',
        connection: {
            filename: `./${config.dbFileName}.sqlite3`
        },
        useNullAsDefault: true
    });

    require('./db.js')(db);

    /* Discord Bot Setup */
    client.on("ready", () => {
        console.log("Bot Connected");
        if (client.guilds.array().length > 1) {
            console.log("Your Key bot can only belong to one server.");
            process.exit(1);
        } else if (client.guilds.array().length == 0) {
            console.log("Your Key bot must be assigned to a server in order to be used.");
            process.exit(1);
        } else {

            guild = client.guilds.array()[0];
            guild.roles.forEach(function (g) {
                availableRoles.push({
                    title: g.title,
                    id: g.id,
                    color: g.color
                });
            });

            console.log('Server:', guild.name);
            console.log('Member Count:', guild.members.array().length);
            console.log('Available Roles:', availableRoles.length);

        }
    });

    client.on("disconnect", () => {
        console.error("An error has occured while trying to establish a connection with your Discord Bot. Please check you special keys in your config.json file and try again.");
        process.exit(1);
    });

    client.on("message", (message) => {
        if (message.channel.type == 'dm' && message.content.startsWith("/activate")) {
            let messageContent = message.content;
            if (messageContent.split(' ').length != 2) {
                message.author.sendMessage('Hey! are you trying to activate yourself to this server? in order to activate your account on this server type the following: ```/activate <assigned key>``` ');
            } else {
                /* Check key */
                let key = messageContent.split(' ')[1];
                let member = guild.member(message.author);
                if (member) {
                    /* TODO: Check if the key is being used by another user or does not exist before adding role  */
                    member.addRoles(roles);
                } else {
                    message.author.sendMessage('Unable to assign role, I could not find you in the server directory.');
                }
            }
        } else if (message.channel.type == 'dm' && !message.content.startsWith("/activate")) {
            message.author.sendMessage('Hey! are you trying to activate yourself to this server? in order to activate your account on this server type the following: ```/activate <assigned key>``` ');
        }
    });

    client.login(config.botSecretKey);

    /* Express Server Setup */
    nunjucks.configure('views', {
        autoescape: true,
        watch: true,
        express: app
    });

    app.use('/resources', express.static(__dirname + '/resources'));

    app.use(bodyParser.json({
        limit: '50mb'
    }));

    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '50mb'
    }));

    app.set('view engine', 'html');

    app.get('/', function(req, res) {
        return res.render('home');
    });

    app.server.listen(process.env.PORT || config.serverPort, () => {
        console.log(`Server is running at http://127.0.0.1:${config.serverPort}`);
    });
}

/* Validate Config File */
fs.readFile('./config.json', function read(err, data) {
    if (err) {
        console.log('Error Occured, could not find a config.json file');
        process.exit(1);
    }
    try {
        let config = JSON.parse(data);
        init(config);
    } catch (e) {
        console.log(e);
        console.log('Error Occured, your config.json file contains invalud JSON syntax.');
        process.exit(1);
    }
});