var myGamePiece;
var myObstacles = [];
var myBonus = [];
var myScore;
var myLives;
var gameRunning = true;

function startGame() {
    myGamePiece = new component(30, 30, "#FFD700", 10, 120);
    myGamePiece.gravity = 0.05;
    myScore = new component("20px", "Arial", "black", 280, 40, "text");
    myLives = new component("20px", "Arial", "black", 280, 20, "text");
    myGameArea.start();
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(e) {
    if (e.code === "Space" && gameRunning) {
        e.preventDefault();
        accelerate(-0.25);
    }
}

function handleKeyUp(e) {
    if (e.code === "Space") {
        accelerate(0.05);
    }
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 500;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.lives = 3;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.collected = false;
    
    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type == "bonus") {
            // Disegna stella
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2, this.y);
            for (var i = 0; i < 5; i++) {
                ctx.lineTo(this.x + this.width/2 + this.width/2 * Math.cos(i * 4 * Math.PI / 5 - Math.PI/2), 
                           this.y + this.height/2 + this.height/2 * Math.sin(i * 4 * Math.PI / 5 - Math.PI/2));
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
        this.hitTop();
    }
    
    this.hitBottom = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    }
    
    this.hitTop = function() {
        if (this.y < 0) {
            this.y = 0;
            this.gravitySpeed = 0;
        }
    }
    
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    
    if (!gameRunning) return;
    
    // Controllo collisioni con ostacoli
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            myGameArea.lives -= 1;
            updateLives();
            if (myGameArea.lives <= 0) {
                endGame();
                return;
            }
        } 
    }
    
    // Controllo collisioni con bonus
    for (i = myBonus.length - 1; i >= 0; i -= 1) {
        if (myGamePiece.crashWith(myBonus[i]) && !myBonus[i].collected) {
            myBonus[i].collected = true;
            myGameArea.frameNo += 50;
            myBonus.splice(i, 1);
        }
    }
    
    myGameArea.clear();
    myGameArea.frameNo += 1;
    
    // Crea ostacoli
    var interval = Math.max(100, 180 - Math.floor(myGameArea.frameNo / 500));
    if (myGameArea.frameNo == 1 || everyinterval(interval)) {
        x = myGameArea.canvas.width;
        minHeight = 40;
        maxHeight = 150;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = 80;
        maxGap = 140;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        
        myObstacles.push(new component(15, height, "#2D5016", x, 0));
        myObstacles.push(new component(15, myGameArea.canvas.height - height - gap, "#2D5016", x, height + gap));
        
        // Aggiungi bonus casualmente
        if (Math.random() > 0.7) {
            var bonusY = Math.random() * (myGameArea.canvas.height - 30);
            myBonus.push(new component(20, 20, "#FF1493", x, bonusY, "bonus"));
        }
    }
    
    // Aggiorna ostacoli
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -2;
        myObstacles[i].update();
        if (myObstacles[i].x < -20) {
            myObstacles.splice(i, 1);
        }
    }
    
    // Aggiorna bonus
    for (i = 0; i < myBonus.length; i += 1) {
        myBonus[i].x += -2;
        myBonus[i].update();
        if (myBonus[i].x < -30) {
            myBonus.splice(i, 1);
        }
    }
    
    myScore.text = "⭐ Punti: " + myGameArea.frameNo;
    myScore.update();
    
    myGamePiece.newPos();
    myGamePiece.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function accelerate(n) {
    if (gameRunning) {
        myGamePiece.gravity = n;
    }
}

function updateLives() {
    var livesDisplay = document.getElementById('lives');
    var scores = document.getElementById('score');
    if (livesDisplay) {
        livesDisplay.textContent = "❤️ Vite: " + myGameArea.lives;
    }
}

function endGame() {
    gameRunning = false;
    clearInterval(myGameArea.interval);
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = 'Punteggio Finale: ' + myGameArea.frameNo;
}

window.addEventListener('load', function() {
    startGame();
});