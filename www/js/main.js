function ServerInteraction() {
    var url = "wss://" + window.location.host + "/";
    var self = this;
    this.isConnected = false;
    this.connection = new WebSocket(url);
    this.remotePlayerData = [];
    
    this.connection.onopen = function() {
        self.isConnected = true;
    };
    
    this.connection.onerror = function() {
        self.isConnected = false;
    };
    
    this.connection.onmessage = function(e) {
        self.remotePlayerData = JSON.parse(e.data);
    };
    
    this.getPlayers = function() {
        var players = [];
        this.remotePlayerData.forEach(function(json) {
            var player = new CurvePlayer();
            player.fromJSON(json);
            
            players.push(player);
        });
        
        return players;
    };
    
    this.send = function(curve) {
        if(!this.isConnected)
            return;
            
        this.connection.send(JSON.stringify(curve));
    };
}

function Position2D(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    
    this.fromJSON = function(json) {
        this.x = json.x;
        this.y = json.y;
    };
    
    this.valuesFrom = function(other) {
        this.x = other.x;
        this.y = other.y;
    };
    
    this.equals = function(other) {
        return this.x == other.x && this.y == other.y;
    };
}

function CurvePlayer(startPos, color) {
    // Stroke color
    this.color = color || "blue";
    
    // Create default position if no position is set
    if(!startPos)
        startPos = new Position2D();
    
    // Line data
    this.lineData = [startPos];
    
    // Start angle (0°)
    this.angle = 0;
    
    this.fromJSON = function(json) {
        this.color = json.color;
        this.lineData = json.lineData;
        this.angle = json.angle;
    };
    
    this.keyHandler = function(right, left) {
        var constant = 20;
        
        // Increase / Decrease angle
        if(right) this.angle += constant;
        if(left) this.angle -= constant;
    };
    
    this.calculatePosition = function(ctx) {
        // Fetch last position and create a new point on the last position's pos
        var lastPosition = this.lineData[this.lineData.length - 1];
        var newPosition = new Position2D(lastPosition.x, lastPosition.y);
        
        // Calculate the new point
        var constant = 2;
        newPosition.x = lastPosition.x + Math.cos(this.angle * Math.PI / 180) * constant;
        newPosition.y = lastPosition.y + Math.sin(this.angle * Math.PI / 180) * constant;
            
        // Append new point to the line data
        this.lineData = this.lineData.concat([newPosition]);
    };
    
    this.draw = function(ctx) {
        // Calculate new position
        this.calculatePosition(ctx);
        
        // Begin path
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        
        // Set position to start
        var firstPosition = this.lineData[0];
        ctx.moveTo(firstPosition.x, firstPosition.y);

        // Draw all points
        this.lineData.forEach(function(pos) {
            ctx.lineTo(pos.x, pos.y);  
        });
        
        // Set width
        ctx.lineWidth = 3;
        
        // Fill
        ctx.stroke();
    };
}

function Game(ctx, serverInteraction) {
    this.ctx = ctx;
    this.player = new CurvePlayer();
    this.serverInteraction = serverInteraction;
    
    // Draw all curves
    this.gameHandler = function() {
        // Clear canvas
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.player.calculatePosition();
        // Send player object to the server
        this.serverInteraction.send(this.player);
        
        var players = this.serverInteraction.getPlayers();
        
        // Draw everything
        players.forEach(function(player) {
            player.draw(this.ctx); 
        }, this);
    };
    
    // Forward pressed keys to all curves
    this.keyHandler = function(right, left) {
        this.player.keyHandler(right, left);
    };
}

$(document).ready(function() {
    var ctx = document.getElementById("canvas").getContext("2d");
    
    // Resize canvas if window is resized
    function resizeHandler() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        
        // Scale display
        ctx.scale(window.innerWidth * (1/1920), window.innerHeight * (1/1080));
    }
    
    // Set default canvas size
    resizeHandler();
    
    // Add resize handler
    $(window).resize(resizeHandler);
    
    var x = new ServerInteraction();
    x.send(new CurvePlayer());
    
    // Create game 
    var game = new Game(ctx, new ServerInteraction());
    
    // Keyboard handling
    $(window).keyup(function(event) {
        game.keyHandler(
            (event.which == 68 || event.which == 39),
            (event.which == 65 || event.which == 37)
        );
    });
    
    
    // Game loop
    setInterval(function() {
        game.gameHandler();
    }, 50);
});