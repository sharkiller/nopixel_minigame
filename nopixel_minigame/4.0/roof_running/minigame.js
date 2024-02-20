let timer_start, timer_time, timerStart, pos_checked;
let game_started = false;
let streak = 0;
let max_streak = 0;
let best_time = 99.999;

let mode = 5;

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)
let getMaxStreakFromCookie = () => {
    let str = getCookieValue('max-streak_roof_running');
    if(str !== '')
        return parseInt(str, 10);
    else
        return 0;
}
let getBestTimeFromCookie = () => {
    let str = getCookieValue('best-time_roof_running');
    if(str !== '')
        return parseFloat(str);
    else
        return 99.999;
}
max_streak = getMaxStreakFromCookie();
best_time = getBestTimeFromCookie();

const sleep = (ms, fn) => {return setTimeout(fn, ms)};

// Option
document.querySelector('#grid').addEventListener('input', function(ev){
    document.querySelector('.grid_value').innerHTML = ev.target.value + 'x' + ev.target.value;
    mode = parseInt(ev.target.value, 10);
    streak = 0;
    reset();
});
// Resets
document.querySelector('.btn_again').addEventListener('click', function(){
    streak = 0;
    reset();
});

function isValid(type, pos, color){
    switch (type) {
        case 'left':
            if(pos%mode === 0) return false;
            pos = pos - 1;
            if(pos < 0) return false;
            break;
        case 'right':
            pos = pos + 1;
            if(pos >= (mode**2) || pos%mode === 0) return false;
            break;
        case 'top':
            pos = pos - mode;
            if(pos < 0) return false;
            break;
        case 'bottom':
            pos = pos + mode;
            if(pos >= (mode**2)) return false;
            break;
    }
    if(pos_checked.includes(pos)) return false;
    
    if( document.querySelectorAll('.group')[pos].dataset.color === color ){
        pos_checked.push(pos);
        document.querySelectorAll('.group')[pos].classList.remove(color);
        document.querySelectorAll('.group')[pos].classList.add('removed');
        document.querySelectorAll('.group')[pos].dataset.remove = '1';
        checkAdjacent(pos, color);
        return pos;
    }
    return false;
}

function checkAdjacent(pos, color){
    isValid('left', pos, color);
    isValid('right', pos, color);
    isValid('top', pos, color);
    isValid('bottom', pos, color);
}

function deleteChecked(){

    const groups = document.querySelectorAll('.group');
    for(let i= (mode**2)-1; i >= mode; i--){
        if( groups[i].dataset.remove === '1'){
            let pos = i - mode;
            while(pos >= 0){
                if(groups[pos].dataset.remove !== '1'){
                    // Replace
                    delete groups[i].dataset.remove;
                    groups[i].classList.remove('removed');
                    groups[i].classList.add(groups[pos].dataset.color);
                    groups[i].dataset.color = groups[pos].dataset.color;
                    // Remove old
                    groups[pos].dataset.remove = '1';
                    groups[pos].classList.remove(groups[pos].dataset.color);
                    groups[pos].classList.add('removed');
                    delete groups[pos].dataset.color;
                    pos=0;
                }
                pos=pos - mode;
            }
        }
    }
}

function joinColumns(){
    const groups = document.querySelectorAll('.group');
    for(let i= (mode**2)-mode; i <= (mode**2)-2; i++){
        if( groups[i].dataset.remove === '1'){
            let pos = i+1;
            let maxH = maxHorizontal(i);
            while(pos-i <= maxH){
                if(groups[pos].dataset.remove !== '1'){
                    let pos_diff = pos-i;
                    for(let vpos=pos; vpos>=0; vpos=vpos - mode){
                        if(groups[vpos].dataset.remove !== '1'){
                            // Replace
                            delete groups[vpos-pos_diff].dataset.remove;
                            groups[vpos-pos_diff].classList.remove('removed','red','green','blue');
                            groups[vpos-pos_diff].classList.add(groups[vpos].dataset.color);
                            groups[vpos-pos_diff].dataset.color = groups[vpos].dataset.color;
                            // Remove old
                            groups[vpos].dataset.remove = '1';
                            groups[vpos].classList.remove(groups[vpos].dataset.color);
                            groups[vpos].classList.add('removed');
                            delete groups[vpos].dataset.color;
                        }
                    }
                    pos=(mode**2);
                }
                pos++;
            }
        }
    }
}

function listener(ev){
    if(!game_started) return;
    
    let pos_clicked = parseInt(ev.target.dataset.position);
    let pos_color = ev.target.dataset.color;
    
    checkAdjacent(pos_clicked, pos_color);
    
    deleteChecked();
    
    joinColumns();
    
    pos_checked = [];
    
    check();
}

function addListeners(){
    document.querySelectorAll('.group').forEach(el => {
        el.addEventListener('mousedown', listener);
    });
}

function check(){
    if(document.querySelectorAll('.group.removed').length === (mode**2)){
        stopTimer();
        streak++;
        if(streak > max_streak){
            max_streak = streak;
            document.cookie = "max-streak_roof_running="+max_streak;
        }
        let time = document.querySelector('.streaks .time').innerHTML;
        if(parseFloat(time) < best_time){
            best_time = parseFloat(time);
            document.cookie = "best-time_roof_running="+best_time;
        }
        reset();
    }
}

function maxHorizontal(pos){
    let max = (pos+1) % mode;
    if(max > 0) return mode - max;
        else return 0;
}

function reset(){
    game_started = false;

    resetTimer();
    clearTimeout(timer_start);

    max_streak = getMaxStreakFromCookie();
    best_time = getBestTimeFromCookie();

    document.querySelector('.splash').classList.remove('hidden');
    document.querySelector('.groups').classList.add('hidden');

    document.querySelectorAll('.group').forEach(el => { el.remove(); });

    start();
}

function start(){
    pos_checked = [];

    let div = document.createElement('div');
    let colors = ['red', 'green', 'blue'];
    div.classList.add('group','group'+mode);
    const groups = document.querySelector('.groups');
    for(let i=0; i < (mode**2); i++){ 
        let group = div.cloneNode();
        let randomColor = colors[Math.floor(Math.random() * colors.length)];
        group.dataset.position = i.toString();
        group.dataset.color = randomColor;
        group.classList.add(randomColor);
        groups.appendChild(group);
    }

    addListeners();

    document.querySelector('.streak').innerHTML = streak;
    document.querySelector('.max_streak').innerHTML = max_streak;
    document.querySelector('.best_time').innerHTML = best_time;

    timer_start = sleep(500, function(){
        document.querySelector('.splash').classList.add('hidden');
        document.querySelector('.groups').classList.remove('hidden');
        
        game_started = true;

        startTimer();
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