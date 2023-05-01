let timer_start, timer_finish, timer_hide, timer_time, good_positions, best_route, blinking_pos, last_pos, wrong, speed, timerStart;
let game_started = false;
let streak = 0;
let max_streak = 0;
let best_time = 99.999;
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');


// Set the canvas size
canvas.width = 500;
canvas.height = 500;

const amountOfDots = 5;
const minLinks = 2;
const maxLinks = amountOfDots - 1;
let selectedDot = null; // Keeps track of the selected dot, if any.
let offset = { x: 0, y: 0 }; // Keeps track of the offset between the mouse position and the selected dot.

let dots = [];
let lines = [];

let intersections = [];

let showIntersections = true;

function createDots () {
    dots = Array.from({ length: amountOfDots }, () => ({
    x: Math.floor(Math.random() * canvas.width),
    y: Math.floor(Math.random() * canvas.height),
  }));
}

function createLines () {
    // Generate random lines connecting the dots
    for (let i = 0; i < amountOfDots; i++) {
        const dot1 = dots[i];
        let connections = 0;
        for (let j = i + 1; j < amountOfDots; j++) {
            // Randomly decide whether to connect the dots
            if (Math.random() < 0.5 && connections < maxLinks) {
                if (!lines.some(item => (item.start == i)
                    && (item.end == j)) && !lines.some(item => (item.start == j)
                    && (item.end == i))) {
                        lines.push({ start: i, end: j });
                }
                connections++;
            }
        }
    
        // Ensure that each dot is connected at least twice and at most four times
        
        while ((connections < minLinks || connections > maxLinks)) {
            const secondIndex = Math.floor(Math.random() * amountOfDots);
            const dot2 = dots[secondIndex];
            if (dot2 !== dot1) {
                if (connections < maxLinks || Math.random() < 0.5) {
                    if (!lines.some(item => (item.start == i)
                        && (item.end == secondIndex)) && !lines.some(item => (item.start == secondIndex)
                        && (item.end == i))) {
                            lines.push({ start: i, end: secondIndex });
                    }
                    connections++;
                }
            }
        }
    }

    // No correct answer if all dots are linked to all dots, so removing one line makes it possible to solve
    if ((lines.length * 2) == (dots.length * maxLinks)) {
        lines.pop();
    }
}

function drawDots () {
    ctx.fillStyle = 'green';
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 7, 0, Math.PI * 2);
        ctx.fill();
    });
}

const maxDistance = 100; // maximum distance between two dots to connect with a line
function redraw() {
    // Clear the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
  
    // Redraw the lines.
    drawLines();
    // Redraw the dots.
    drawDots();
}
function getLineDot (index) {
    return dots[index];
}

function detectIntersects() {
    intersections = [];
    lines.forEach(line => line.intersecting = null);
    // Detect intersecting lines
    for (var i = 0; i < lines.length; i++) {
        for (var j = i + 1; j < lines.length; j++) {
            var line1 = lines[i];
            var line2 = lines[j];
        
            // Calculate intersection point (if it exists)
            var intersection = getIntersection(getLineDot(line1.start).x, getLineDot(line1.start).y, getLineDot(line1.end).x, getLineDot(line1.end).y, getLineDot(line2.start).x, getLineDot(line2.start).y, getLineDot(line2.end).x, getLineDot(line2.end).y);
            const linepoints = [getLineDot(line1.start), getLineDot(line1.end), getLineDot(line2.start), getLineDot(line2.end)];
            if (intersection != null && linepoints.some(item => item.x === intersection.x && item.y === intersection.y))
            {
                intersection = null;
            }
            if (intersection) {
                intersections.push(intersection);
            }
            if (showIntersections && intersection) {
                ctx.fillStyle = 'blue';
                ctx.beginPath();
                ctx.arc(intersection.x, intersection.y, 9, 0, Math.PI * 2);
                ctx.fill();

            }
        
            // If there is an intersection, mark both lines as intersecting
            if (intersection != null) {
                line1.intersecting = true;
                line2.intersecting = true;
            }
        }
    }
}

function drawLines () {
    detectIntersects();
    // Draw lines
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    lines.forEach(line => {
        const { start, end } = line;
        ctx.beginPath();
        ctx.moveTo(getLineDot(start).x, getLineDot(start).y);
        ctx.lineTo(getLineDot(end).x, getLineDot(end).y);
        if (line.intersecting) {
            ctx.strokeStyle = 'red';
        } else {
            ctx.strokeStyle = 'green';
        }
        ctx.stroke();
    });
}

// Helper function to calculate intersection point of two lines
function getIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    var det1 = (x1 - x2) * (y3 - y4);
    var det2 = (y1 - y2) * (x3 - x4);
    var det = det1 - det2;
    if (det === 0) {
      // Lines are parallel
      return null;
    }
    var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / det;
    var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / det;
    if (x < Math.min(x1, x2) || x > Math.max(x1, x2) || y < Math.min(y1, y2) || y > Math.max(y1, y2)) {
        return null;
    }
    if (x < Math.min(x3, x4) || x > Math.max(x3, x4) || y < Math.min(y3, y4) || y > Math.max(y3, y4)) {
        return null;
    }
    return { x: x, y: y };
}

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)
let getMaxStreakFromCookie = () => {
    let str = getCookieValue('max-streak_untangle');
    if(str !== '')
        return parseInt(str, 10);
    else
        return 0;
}
let getBestTimeFromCookie = () => {
    let str = getCookieValue('best-time_untangle');
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
    // Options
    document.querySelector('#showIntersections').addEventListener('input', function(ev){
        streak = 0;
        reset();
    });
    
    // Resets
    document.querySelector('.btn_again').addEventListener('click', function(){
        streak = 0;
        reset();
    });
    canvas.addEventListener('mousedown', e => {
        // Loop through all the dots to see if the mouse is inside one of them.
        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i];
          const dx = e.offsetX - dot.x;
          const dy = e.offsetY - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= 7) {
            selectedDot = dot;
            offset.x = dx;
            offset.y = dy;
            break;
          }
        }
    });
      
    canvas.addEventListener('mousemove', e => {
        // If a dot is currently selected, move it to the new mouse position.
        if (selectedDot !== null) {
          selectedDot.x = e.offsetX - offset.x;
          selectedDot.y = e.offsetY - offset.y;
          redraw(); // Redraw the dots and lines.
        }
    });
      
    canvas.addEventListener('mouseup', e => {
        // Deselect the dot when the mouse button is released.
        selectedDot = null;
        check();
    });
}

function check(timeout){
    if (timeout) {
        stopTimer();
    }
    if(intersections.length === 0){
        streak++;
        if(streak > max_streak){
            max_streak = streak;
            document.cookie = "max-streak_untangle="+max_streak;
        }
        let time = document.querySelector('.streaks .time').innerHTML;
        if(parseFloat(time) < best_time){
            best_time = parseFloat(time);
            document.cookie = "best-time_untangle="+best_time;
        }
        if (!timeout) {
            stopTimer();
            reset();
        }
    }
    if (timeout) {
        streak = 0;
        reset();
    }
}

function reset(){

    resetTimer();
    clearTimeout(timer_start);
    clearTimeout(timer_hide);
    clearTimeout(timer_finish);

    max_streak = getMaxStreakFromCookie();
    best_time = getBestTimeFromCookie();

    document.querySelector('.splash').classList.remove('hidden');
    document.querySelector('.untanglecanvas').classList.add('hidden');

    start();
}

function start(){
    showIntersections = document.querySelector('#showIntersections').checked;
    // Clear the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    intersections = [];

    addListeners();

    while(intersections < 1) {
        createDots();
        createLines();
        drawLines();
        drawDots();
    }

    document.querySelector('.streak').innerHTML = streak;
    document.querySelector('.max_streak').innerHTML = max_streak;
    document.querySelector('.best_time').innerHTML = best_time;

    timer_start = sleep(2000, function(){
        document.querySelector('.splash').classList.add('hidden');
        document.querySelector('.untanglecanvas').classList.remove('hidden');
        
        game_started = true;

        startTimer();
        speed = document.querySelector('#speed').value;
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
}
function resetTimer(){
    clearInterval(timer_time);
    document.querySelector('.streaks .time').innerHTML = '0.000';
}

start();