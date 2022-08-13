var gameCart;
var x;
var force = 0 ;
var pressedKey = false;
var controlOn = true;
const LEFTARROW = 37;
const RIGHTARROW = 39;
const X_BOUND = 160;
const dT = 40; //ms
const dTs = dT/1000; //s
function startGame() {
    x0 = [0, 0, 0.05, 0]; //[px vx th om]
    gameCart = new cartPendulum(x0);
    myGameArea.start();
}

var myGameArea = {
    canvas : document.getElementById("pendulumCanvas"),
    start : function() {
        this.canvas.width = 380;
        this.canvas.height = 252;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, dT); 
        this.context.translate(this.canvas.width/2, this.canvas.height/2)       
    },
    stop : function() {
        clearInterval(this.interval);
    },    
    clear : function() {
        this.context.clearRect(-this.canvas.width/2, -this.canvas.height/2, this.canvas.width, this.canvas.height);
    }
}

function setControlRight(){
    force = 1;
    pressedKey = true
}
function setControlLeft(){
    force = -1;
    pressedKey = true
}
function resetControl(){
    force = 0;
    pressedKey = false
}



var err2 = 0
var err1 = 0 
var err0 = 0
var output = 0
const kp = 0.4;
const kd = 0.001;
const ki = 0.00001;
function pidControl(x){
    y = x[0]*0.04 + x[1]*0.02 + x[2]*10 + x[3]*1
    err2 = err1
    err1 = err0
    err0 = 0 + y
    output += (kp + ki*dT + kd/dTs) * err0 + (-kp - 2*kd/dTs) * err1 + (kd/dTs) * err2
    return output
}

function toggleController(){
    controlOn = !controlOn
    err2 = 0
    err1 = 0 
    err0 = 0
    output = 0
}

function controlLyapunovFunction(x){
    const dxs = [gameCart.f(x,1),gameCart.f(x,-1)]
    let dvp = 0
    let dvn = 0
    const weight = [00, 100, 0, 100];
    x.forEach(function(currentValue, index){
        dvp +=currentValue*dxs[0][index]*weight[index]
        dvn +=currentValue*dxs[1][index]*weight[index]
    })
    console.log(x)
    //console.log(Math.min(dvp,dvn))
    if(dvp<dvn)
        return 1
    else return -1
}


$(document).keydown(function (e) { 
    if(e.which==LEFTARROW)
        setControlLeft();
    else if(e.which==RIGHTARROW)
        setControlRight()
    //console.log(e.which)
});


$(document).keyup(function (e) { 
    if(e.which==LEFTARROW)
        resetControl()
    else if(e.which==RIGHTARROW)
        resetControl()
    else if(e.which==75){
        toggleController();    
    }
});

function cartPendulum(x0,type) {
    this.type = type;
    this.x = x0;
    this.m = 0.005 // kg
    this.M = 0.05 // kg
    this.g = 100 //m/s2
    this.L = 20 //m
    this.d = 0.01 //Ns/m
    this.k = 1.3 //Ns/rad
    this.Mm = this.M+this.m
    this.I = this.m*this.L^2/12
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = '#C34';
        ctx.translate(this.x[0],60)
        ctx.fillRect(-30, 0, 60, 20,10);
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-20, 20, 7, 0, 2 * Math.PI);
        ctx.fill()
        ctx.beginPath();
        ctx.arc(20, 20, 7, 0, 2 * Math.PI);
        ctx.fill()
        
        ctx.beginPath()
        ctx.moveTo(-400, 28);
        ctx.lineTo(400, 28);
        ctx.stroke()

        ctx.rotate(this.x[2]+Math.PI)
        ctx.fillStyle = '#23B';
        ctx.fillRect(-5, -10, 10, 150);
        ctx.rotate(-this.x[2]-Math.PI)
        ctx.translate(-this.x[0],-60)
        ctx.fillStyle = 'black';
        ctx.font = "20px Arial";
        ctx.fillText(`"k": turn control ${controlOn?"OFF":"ON"}`, 0, 116);
        if (controlOn){
            ctx.font = "15px Arial";
            ctx.fillStyle = "#2A3"     
            ctx.fillText(`Automatic Control is ON`, -180, 115);
        } 
        
    }
    this.f = function(x,u) {
        const s = Math.sin(x[2])
        const c = Math.cos(x[2])
        const mL = this.m*this.L
        const mLc = mL*c
        // const u = force -this.d*x[1]
        const ImL2 = this.I+mL*this.L 
        // const uTerm = (-force*10 +mL*x[3]**2*s-this.d*x[1])
        // const D1 = ImL2*this.Mm-(mL*c)**2
        // dx2 = -((mL)^2*this.g*c*s+uTerm*ImL2)/D1
        // dx4 = (this.Mm*(mL*this.g*s)-uTerm*mL*c)/D1

        // dx2 = (u+mL*s*x[3]**2-this.m*this.g*c*s)/(this.Mm-this.m*c**2)
        // dx4 = (u*c-this.Mm*this.g*s+mL*c*s*x[3])/(mL*c**2-this.Mm*this.L)
        
        const mgLs = mL*this.g*s -this.k*x[3]
        const Fterm = u*10+mL*s*x[3]**2 - this.d*x[1] 
        

        const D = ImL2*this.Mm-mLc**2
        const dx2 = (-mLc*mgLs+ImL2*Fterm)/D
        const dx4 = (this.Mm*mgLs -mLc*Fterm)/D
        return [
            this.x[1],
            dx2,
            this.x[3],
            dx4
        ]
    }
    this.newPos = function() {
        const dx = this.f(this.x,force)
        for (let i=0;i<4;i++)
            this.x[i] += dx[i]*dTs
        if(this.x[0]>=X_BOUND)
        {
            this.x[0] = X_BOUND-1
            this.x[1] = 0
        }
        else if(this.x[0]<=-X_BOUND)
        {
            this.x[0] = -X_BOUND+1
            this.x[1] = 0
        }
        if(this.x[2]>=Math.PI)
        {
            this.x[2] -=2*Math.PI
        }
        else if(this.x[2]<=-Math.PI)
        {
            this.x[2] +=2*Math.PI
        } 
        
        //console.log(dx)

    }
}

function updateGameArea() {
    myGameArea.clear();
    if (pressedKey == false && controlOn)
        force = pidControl(gameCart.x)    
    //force = controlLyapunovFunction(gameCart.x)
    gameCart.newPos();
    gameCart.update();
}
startGame()
