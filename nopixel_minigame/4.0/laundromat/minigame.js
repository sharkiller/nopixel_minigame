let timer_start, timer_finish, timer_time, speed, timerStart;
let game_started = false;
let streak = 0;
let max_streak = 0;
let best_time = 99.999;

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

let stage = false

let colors = [];
let lastRotation = 0;
let currentCircle = 1;
let currentCirclePos = [];

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)
let getMaxStreakFromCookie = () => {
    let str = getCookieValue('max-streak_laundromat');
    if(str !== '')
        return parseInt(str, 10);
    else
        return 0;
}
let getBestTimeFromCookie = () => {
    let str = getCookieValue('best-time_laundromat');
    if(str !== '')
        return parseFloat(str);
    else
        return 99.999;
}
max_streak = getMaxStreakFromCookie();
best_time = getBestTimeFromCookie();

const sleep = (ms, fn) => {return setTimeout(fn, ms)};

function addListeners(){
    // Options
    document.querySelector('#speed').addEventListener('input', function(ev){
        document.querySelector('.speed_value').innerHTML = ev.target.value + 's';
        streak = 0;
        reset();
    });
    // Resets
    document.querySelector('.btn_again').addEventListener('click', function(){
        streak = 0;
        reset();
    });
}

function fillColor(color){
    let dots = stage.find('#dots-'+(45 * currentCircle))[0];
    dots.getChildren().forEach(dot => {
        dot.fill(color);
    });
    let sections = stage.find('#section-'+(45 * currentCircle))[0];
    sections.getChildren().forEach(section => {
        section.fill(color);
    });
}

function check(timeout){
    if (timeout) {
        fillColor('rgba(234,6,6,0.8)');
        streak = 0;
        stopTimer();
    }else if(currentCirclePos[45 * currentCircle] === 0){
        if(currentCircle === 5){
            streak++;
            if(streak > max_streak){
                max_streak = streak;
                document.cookie = "max-streak_laundromat="+max_streak;
            }
            let time = document.querySelector('.streaks .time').innerHTML;
            if(parseFloat(time) < best_time){
                best_time = parseFloat(time);
                document.cookie = "best-time_laundromat="+best_time;
            }
            if (!timeout) {
                stopTimer();
                reset();
            }
        }else{
            fillColor('#08AF93DB');
            currentCircle++;
            dots = stage.find('#dots-'+(45 * currentCircle))[0];
            lastRotation = dots.rotation();
        }
    }else{
        fillColor('rgba(234,6,6,0.8)');
        streak = 0;
        stopTimer();
    }
}

function reset(){

    resetTimer();
    clearTimeout(timer_start);
    clearTimeout(timer_finish);

    max_streak = getMaxStreakFromCookie();
    best_time = getBestTimeFromCookie();

    document.querySelector('.splash').classList.remove('hidden');
    document.querySelector('.game-canvas').classList.add('hidden');

    start();
}

document.addEventListener("keydown", function(ev) {
    let key_pressed = ev.key;
    let valid_keys = ['a','d','ArrowRight','ArrowLeft','Enter',' '];

    if(key_pressed === 'r'){
        streak = 0;
        stopTimer();
        reset();
        return;
    }
    if(game_started && valid_keys.includes(key_pressed) ){
        ev.preventDefault();
        let rotation = false;
        switch(key_pressed){
            case 'a':
            case 'ArrowLeft':
                rotation = -1;
                break;
            case 'd':
            case 'ArrowRight':
                rotation = 1;
                break;
            case 'Enter':
            case ' ':
                check();
                return;
        }
        let dots = stage.find('#dots-'+(45 * currentCircle))[0];
        let currentRotation = dots.rotation() - lastRotation;
        
        if(rotation !== false && currentRotation > -30 && currentRotation < 30){
            currentCirclePos[45 * currentCircle] += rotation;
            if(currentCirclePos[45 * currentCircle] < 0) currentCirclePos[45 * currentCircle] = 11;
            if(currentCirclePos[45 * currentCircle] > 11) currentCirclePos[45 * currentCircle] = 0;
            lastRotation += 30 * rotation;
            new Konva.Tween({node: dots, duration: 0.2, rotation: lastRotation}).play();
        }
    }
});

function addDots(radius){
    
    let dotsGroup = new Konva.Group({id: 'dots-'+radius, x: 270, y: 270});

    let cols = ['#dd2169', '#258fe6', '#ffc30a'];
    colors[radius] = [];

    for(let i = 0; i < 12; i++) {
        let randomColor = cols[Math.floor(Math.random() * cols.length)];
        colors[radius][i] = [randomColor, Math.random() > 0.2];
        
        if( colors[radius][i][1] ) {
            dotsGroup.add(new Konva.Circle({
                x: Math.floor(radius * Math.cos(2 * Math.PI * i / 12)),
                y: Math.floor(radius * Math.sin(2 * Math.PI * i / 12)),
                radius: 8,
                fill: randomColor,
            }));
        }
    }
    
    return dotsGroup;
}

function addSections(radius){
    let sectionsGroup = new Konva.Group({id: 'section-'+radius, x: 270, y: 270});

    for(let i = 0; i < 12; i++) {
        if(colors[radius][i][1] && Math.random() > 0.2) {
            sectionsGroup.add(new Konva.Arc({
                fill: colors[radius][i][0],
                innerRadius: radius + 15,
                outerRadius: radius + 20,
                angle: 30,
                rotation:  ((30 * (i+1)) - 45)
            }));
        }
    }
    
    return sectionsGroup;
}

function shuffleDots(){
    for(let i=1; i<=5; i++){
        let randomPos = random(1,11);
        currentCirclePos[45*i] = randomPos;
        let dots = stage.find('#dots-'+(45 * i))[0];
        dots.rotation( 30 * randomPos );
        if(i === 1) lastRotation = 30 * randomPos;
    }  
}


function start(){
    if(stage !== false){
        stage.destroy();
    }
    stage = new Konva.Stage({
        container: 'game-canvas',
        width: 540,
        height: 540,
    });
    colors = [];
    lastRotation = 0;
    currentCircle = 1;
    currentCirclePos = [];
   
    let staticLayer = new Konva.Layer();
    for(let i=1; i<=5; i++){
        staticLayer.add( new Konva.Circle({x: 270, y: 270, radius: 45*i, stroke: 'white', strokeWidth: 2}) );
    }
    for(let i=0; i<=5; i++){
        staticLayer.add( new Konva.Line({x:270,y:270,points: [-240, 0, 240, 0], stroke: '#ffffffa0', strokeWidth: 1, rotation: 30*i}) );
    }
    staticLayer.add( new Konva.Line({points: [0, 540, 540, 540], stroke: '#26303e', strokeWidth: 15}) );
    staticLayer.add( new Konva.Line({id: 'progress',points: [0, 540, 540, 540], stroke: '#ff4e00', strokeWidth: 15}) );
    stage.add(staticLayer);

    let gameLayer = new Konva.Layer({id:'game'});
    for(let i=1; i<=5; i++){
        gameLayer.add(addDots(45*i));
        gameLayer.add(addSections(45*i));
    }
    stage.add(gameLayer);

    shuffleDots();

    document.querySelector('.streak').innerHTML = streak;
    document.querySelector('.max_streak').innerHTML = max_streak;
    document.querySelector('.best_time').innerHTML = best_time;

    timer_start = sleep(500, function(){
        document.querySelector('.splash').classList.add('hidden');
        document.querySelector('.game-canvas').classList.remove('hidden');
        
        game_started = true;

        startTimer();
        speed = document.querySelector('#speed').value;

        let progress = stage.find('#progress')[0];
        new Konva.Tween({node: progress, duration: speed, points: [0, 540, 0, 540]}).play();
        
        timer_finish = sleep((speed * 1000), function(){
            check(true);
        });
    });
}

function startTimer(){
    timerStart = new Date();
    timer_time = setInterval(timer,1);
}
function timer(){
    let timerNow = new Date();
    let timerDiff = new Date();
    timerDiff.setTime(timerNow - timerStart);
    let ms = timerDiff.getMilliseconds();
    let sec = timerDiff.getSeconds();
    if (ms < 10) {ms = "00"+ms;}else if (ms < 100) {ms = "0"+ms;}
    document.querySelector('.streaks .time').innerHTML = sec+"."+ms;
}
function stopTimer(){
    clearInterval(timer_time);
    game_started = false;
}
function resetTimer(){
    clearInterval(timer_time);
    document.querySelector('.streaks .time').innerHTML = '0.000';
}

addListeners();

start();


