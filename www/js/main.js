function Position2D(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    
    this.valuesFrom = function(other) {
        this.x = other.x;
        this.y = other.y;
    }
    
    this.equals = function(other) {
        return this.x == other.x && this.y == other.y;
    }
}

function CurvePlayer(startPos, color) {
    this.color = color || "blue";
    
    // Create default position if no position is set
    if(!startPos)
        startPos = new Position2D();
    
    // Line data
    this.lineData = [startPos];
    
    // Start angle (0°)
    this.angle = 0;
    
    this.keyHandler = function(right, left) {
        var constant = 10;
        
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
        
        // Fill
        ctx.stroke();
    };
}

function Game(ctx, curvePlayers) {
    this.ctx = ctx;
    this.curvePlayers = curvePlayers || [];
    
    // Draw all curves
    this.gameHandler = function() {
        // Clear canvas
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Draw everything
        this.curvePlayers.forEach(function(line) {
            line.draw(this.ctx); 
        }, this);
    };
    
    // Forward pressed keys to all curves
    this.keyHandler = function(right, left) {
        this.curvePlayers.forEach(function(curvePlayer) {
            curvePlayer.keyHandler.apply(curvePlayer, [right, left]); 
        });  
    };
}

$(document).ready(function() {
    var ctx = document.getElementById("canvas").getContext("2d");
    
    // Resize canvas if window is resized
    function resizeHandler() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    }
    
    // Set default canvas size
    resizeHandler();
    
    // Add resize handler
    $(window).resize(resizeHandler);
     
    // Create game 
    var game = new Game(ctx, [new CurvePlayer(), new CurvePlayer(new Position2D(50, 50), "red")]);
    
    // Keyboard handling
    $(window).keydown(function(event) {
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