var express = require("express");

var app = express();


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

app.listen(process.env.PORT);