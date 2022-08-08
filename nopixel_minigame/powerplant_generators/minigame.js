let timer_start, timer_game, timer_finish, timer_time, timer_hide, letters, difficulty, valid_keys, timerStart;
let game_started = false;
let streak = 0;
let max_streak = 0;
let best_time = 0;

const sleep = (ms, fn) => {return setTimeout(fn, ms)};

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let readCookie = () => {
    // Get max streak from cookie
    let regex = new RegExp("max-streak_powerplant_"+difficulty[3]+"=([\\d]+)",'g');
    let cookie = document.cookie;
    if((cookie = regex.exec(cookie)) !== null){
        max_streak = cookie[1];
    }else{
        max_streak = 0;
    }
    // Get max streak from cookie
    let regex_time = new RegExp("best-time_powerplant_"+difficulty[3]+"=([\\d.]+)",'g');
    cookie = document.cookie;
    if((cookie = regex_time.exec(cookie)) !== null){
        best_time = parseFloat(cookie[1]);
    }else{
        best_time = 0;
    }
}

const getDifficulty = () => {
    let difficulty_selected = document.querySelector('input[name="difficulty"]:checked').value;
    
    switch(difficulty_selected){
        case 'easy':
            return ["asd", 2000, 1000, 'easy'];
        case 'medium':
            return ["asdjkl", 1500, 750, 'medium'];
        case 'hard':
            return ["awsdgjikl", 1200, 500, 'hard'];
    }
}

// Difficulty changed
document.querySelectorAll('input[name="difficulty"]').forEach((el) => {
    el.addEventListener('change', function(){
        streak = 0;
        reset();
    });
});
// Resets
document.querySelector('.btn_again').addEventListener('click', function(){
    streak = 0;
    reset();
});

document.addEventListener("keydown", function(ev) {
    let key_pressed = ev.key;
    if(game_started && valid_keys.includes(key_pressed) ){
        let element = letters[0].el;
        let top = -590 * element.dataset.progress;
        if(top < -475 && top > -580 && key_pressed === element.textContent){//
            letters[0].el.classList.add('green');
            streak++;
            if(streak > max_streak){
                max_streak = streak;
                document.cookie = "max-streak_powerplant_"+difficulty[3]+"="+max_streak;
            }
            let time = document.querySelector('.streaks .time').innerHTML;
            if(parseFloat(time) > best_time){
                best_time = parseFloat(time);
                document.cookie = "best-time_powerplant_"+difficulty[3]+"="+best_time;
            }
        }else{
            streak = 0;
            resetTimer();
            startTimer();
            letters[0].el.classList.add('red');
        }
        document.querySelector('.streak').innerHTML = streak;
        document.querySelector('.max_streak').innerHTML = max_streak;
        document.querySelector('.best_time').innerHTML = best_time;
        
        letters[0].stop();
        
        new mojs.Html({
            el: element,
            y: top,
            opacity: {
                1:0,
                duration: 500,
            },
            duration: 500,
            onComplete() {
                element.remove();
            },
        }).play();
        letters.splice(0,1);
    }
});

let createLetter = () => {
    let pos = random(1,4);
    let lettersElem = document.querySelector('.minigame .letters');
    let div = document.createElement('div');
    div.classList.add('letter', 'pos'+pos);
    div.innerHTML = difficulty[0].charAt(random(0, difficulty[0].length - 1));
    lettersElem.append(div);
    let duration = difficulty[1];
    let lettersCnt = letters.length;
    letters.push(new mojs.Html({
        el: div,
        y: {
            0:-590,
            duration: duration,
            easing: 'linear.none',
            onProgress (p) {
                div.dataset.progress = p;
            },
        },
        opacity: {
            0:1,
            duration: 200,
            easing: 'linear.none'
        },
        duration: duration,
        onComplete() {
            div.classList.add('red');
            streak = 0;
            resetTimer();
            startTimer();
            letters.splice(0,1);
        },
        onUpdate() {
            if(game_started === false) this.pause();
        }
    }));
    letters[lettersCnt].then({
        opacity: 0,
        duration: 500,
        onComplete() {
            div.remove();
        },
    }).play()
}

function reset(restart = true){
    game_started = false;

    resetTimer();
    clearTimeout(timer_start);
    clearTimeout(timer_game);
    clearTimeout(timer_finish);
    clearTimeout(timer_hide);

    if(restart){
        document.querySelector('.minigame .hack').classList.add('hidden');
        document.querySelector('.minigame .splash').classList.remove('hidden');
        document.querySelector('.minigame .letters').innerHTML = '';
        start();
    }
}

function start(){

    timer_start = sleep(1000, function(){
        document.querySelector('.minigame .splash').classList.add('hidden');
        document.querySelector('.minigame .hack').classList.remove('hidden');
        
        difficulty = getDifficulty();
        readCookie();

        document.querySelector('.streak').innerHTML = streak;
        document.querySelector('.max_streak').innerHTML = max_streak;
        document.querySelector('.best_time').innerHTML = best_time;
        
        valid_keys = difficulty[0].split('');
        letters = [];
        game_started = true;
        
        timer_game = setInterval(createLetter, difficulty[2]);
        
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