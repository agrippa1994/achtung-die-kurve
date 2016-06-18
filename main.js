var express = require("express");
var WebSocketServer = require("ws").Server;

var app = express();
var httpServer = require("http").createServer();
var wsServer = new WebSocketServer({ server: httpServer });

app.get("*", (req, res) => {
    var options = {
        root: __dirname + "/www/",
        dotfiles: "deny",
        index: "index.html",
        headers: {
            "x-timestamp": Date.now(),
            "x-sent": true
        }
    };
    
    var fileName = req.params["0"];
    res.sendFile(fileName, options, (error) => {
       if(error) {
           console.error("Error while sending file: " + error);
           res.status(error.status || 500).end();
       }
    });
});

var playerData = [];
var lastID = 0;
wsServer.on("connection", function(ws) {
    console.log("IP: " + ws.ip);    
    
    ws.id = lastID;
    lastID++;
    
    ws.on("message", function(data) {
        console.log(ws.id);
        playerData[ws.id] = JSON.parse(data);
        
        var sendData = [];
        for(var player in playerData) {
            sendData.push(playerData[player]);
        }
        
        console.log(sendData.length);
        wsServer.clients.forEach(function(client) {
            client.send(JSON.stringify(sendData)); 
        });
    });
    
});

httpServer.on("request", app);
httpServer.listen(process.env.PORT);