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

function Line(startPos, color) {
    this.color = color || "blue";
    if(!startPos)
        startPos = new Position2D();
        
    this.lineData = [startPos];
    this.angle = 0;
    
    this.keyHandler = function(right, left) {
        var constant = 10;
        
        if(right) this.angle += constant;
        if(left) this.angle -= constant;
    };
    
    this.calculatePosition = function(ctx) {
        var lastPosition = this.lineData[this.lineData.length - 1];
        var newPosition = new Position2D(lastPosition.x, lastPosition.y);
        
        var constant = 2;
        newPosition.x = lastPosition.x + Math.cos(this.angle * Math.PI / 180) * constant;
        newPosition.y = lastPosition.y + Math.sin(this.angle * Math.PI / 180) * constant;
            
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

function Game(ctx, lines) {
    this.ctx = ctx;
    this.lines = lines || [];
    
    this.gameHandler = function() {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        this.lines.forEach(function(line) {
            line.draw(this.ctx); 
        }, this);
    };
    
    this.keyHandler = function(right, left) {
        this.lines.forEach(function(line) {
            line.keyHandler.apply(line, [right, left]); 
        });  
    };
}

$(document).ready(function() {
    var ctx = document.getElementById("canvas").getContext("2d");
    
    function resizeHandler() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    }
    
    resizeHandler();
    
    var game = new Game(ctx, [new Line(), new Line(new Position2D(50, 50), "red")]);
    
    $(window).resize(resizeHandler);
    $(window).keydown(function(event) {
        game.keyHandler(
            (event.which == 68 || event.which == 39),
            (event.which == 65 || event.which == 37)
        );
    });
    
    
    
    setInterval(function() {
        game.gameHandler();
    }, 50);
});