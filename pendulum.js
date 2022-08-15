var gameCart;
var x;
var force = 0 ;
var pressedKey = false;
var timerStart = 0.0
var timerOn = false;
var maxTime = 0
var controlOn = true;
var swingingUp = false;
var touchStart;
var lastTap= 0;
const LEFTARROW = 37;
const RIGHTARROW = 39;
const X_BOUND = 150;
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
        this.canvas.width = 360;
        this.canvas.height = 252;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, dT); 
        this.context.translate(this.canvas.width/2, this.canvas.height/2)   
        $(this.canvas).bind('touchstart', function (e){
            toggleController()
            const diff = e.timeStamp-lastTap
            if(diff<500 && diff>0)
                startSwingUp()
        
            lastTap = e.timeStamp
        })  
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
const K = [       -0.0032,   -0.0365  , -4.6883 ,  -1.8745]
function stateSpaceControl(x){
    let u = 0
    x.forEach(function(currentValue, index){
        u -=currentValue*K[index]
    })
    //console.log(u)
    return u
}

function startSwingUp(){
    console.log("start swing up")
    swingingUp = true
    force = gameCart.x[0]<0? 1.0 : -1.0;
    toggleSwingUp = () => {
        force = -1*force
        console.log(`toggle: ${force}`)
        if (swingingUp)
            window.setTimeout(toggleSwingUp,
                gameCart.resonancePeriod*500 
            );               
    } 
    window.setTimeout(toggleSwingUp,
        gameCart.resonancePeriod*500 
    );     
}

thetaInsideInterval= () => Math.abs(gameCart.x[2])<=Math.PI/2




function toggleController(){
controlOn = !controlOn
swingingUp = false
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
        if (thetaInsideInterval())
            toggleController();    
    }
    else if(e.which==83){
        if (~thetaInsideInterval())
            startSwingUp();    
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

    this.resonancePeriod = Math.sqrt(this.L/this.g)*(2*Math.PI)
    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = '#C34';
        ctx.translate(this.x[0],50)
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
        ctx.translate(-this.x[0],-50)
        ctx.fillStyle = 'black';
        ctx.font = "20px Arial";
        ctx.fillText(`"k" or tap to turn automatic control ${controlOn?"OFF":"ON"}`, -175, 116);
        if (controlOn){
            ctx.font = "15px Arial";
            ctx.fillStyle = "#291"     
            ctx.fillText(`Automatic Control is ON`, -175, 95);
        }
        else if (swingingUp){
            ctx.font = "15px Arial";
            ctx.fillStyle = "#771"     
            ctx.fillText(`Swinging up...`, -175, 95);
        } 
        else if (!thetaInsideInterval()){
            ctx.font = "15px Arial";
            ctx.fillStyle = "#921"     
            ctx.fillText(`Control Disabled: swing up (with "s" or double tap)`, -175, 95);
        }
        ctx.font = "15px Arial";
        ctx.fillStyle = "#222"     
        
        if (timerOn){
            const timeUp = Math.round(Date.now() / 1000) - timerStart
            if (timeUp>maxTime)
                maxTime=timeUp;
                ctx.fillText(`Time up:\t${timeUp}`, 55, -110);
         
        }
        else   
            ctx.fillText(`Time up:\t-`, 55, -110);
        ctx.fillText(`Record:\t${maxTime}`, 55, -96);

        
        
        
        
    }
    this.f = function(x,u) {
        const s = Math.sin(x[2])
        const c = Math.cos(x[2])
        const mL = this.m*this.L
        const mLc = mL*c
        
        const ImL2 = this.I+mL*this.L 
        
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
        var inForce = (force>10)? 10 : (force<-10)? -10: force
        if(this.x[0]>=X_BOUND)
        {
            this.x[0] = X_BOUND-1
            this.x[1] = 0
            if(inForce>0)
                inForce=0
        }
        else if(this.x[0]<=-X_BOUND)
        {
            this.x[0] = -X_BOUND+1
            this.x[1] = 0
            if(inForce<0)
                inForce=0
        }
        
        const dx = this.f(this.x,inForce)
        
        for (let i=0;i<4;i++)
            this.x[i] += dx[i]*dTs
        
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
    if (!thetaInsideInterval()){
        controlOn = false
        timerOn = false
    }
    else if (!controlOn && !timerOn){
        timerOn = true
        timerStart = Math.round(Date.now() / 1000);
    }
    if (pressedKey == false && controlOn)
        //force = pidControl(gameCart.x)
        force = stateSpaceControl(gameCart.x)   
    else if (pressedKey==false && !swingingUp)
        force = 0 
    else if (swingingUp && Math.abs(gameCart.x[2])<Math.PI/10){
        swingingUp=false
        console.log("swung up")
    }
    //force = controlLyapunovFunction(gameCart.x)
    gameCart.newPos();
    gameCart.update();
}
startGame()
