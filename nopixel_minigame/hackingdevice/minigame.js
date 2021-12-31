let timer_start, timer_game, timer_finish, timer_time, timer_hide, correct_pos, to_find, codes, sets, timerStart;
let game_started = false;
let streak = 0;
let max_streak = 0;
let best_time = 99.999;
let codes_pos = 0;
let current_pos = 43;

// Get max streak from cookie
const regex = /max-streak_hackingdevice=([\d]+)/g;
let cookie = document.cookie;
if((cookie = regex.exec(cookie)) !== null){
    max_streak = cookie[1];
}
// Get max streak from cookie
const regex_time = /best-time_hackingdevice=([\d.]+)/g;
cookie = document.cookie;
if((cookie = regex_time.exec(cookie)) !== null){
    best_time = parseFloat(cookie[1]);
}

const sleep = (ms, fn) => {return setTimeout(fn, ms)};

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}
const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

const randomSetChar = () => {
    let str='?';
    switch(sets){
        case 'numeric':
            str="0123456789";
            break;
        case 'alphabet':
            str="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            break;
        case 'alphanumeric':
            str="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            break;
        case 'greek':
            str="ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ";
            break;
        case 'braille':
            str="⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿"+
                "⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿"+
                "⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿";
            break;
        case 'runes':
            //str="ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ";
            str="ᚠᚥᚧᚨᚩᚬᚭᚻᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛤ";
            break;
    }
    return str.charAt(random(0,str.length));
}

// Options
document.querySelector('#timeout').addEventListener('input', function(ev){
    document.querySelector('.timeout_value').innerHTML = ev.target.value + 's';
    streak = 0;
    reset();
});
// Resets
document.querySelector('.btn_again').addEventListener('click', function(){
    streak = 0;
    reset();
});

document.addEventListener("keydown", function(ev) {
    let key_pressed = ev.key;
    let valid_keys = ['a','w','s','d','ArrowUp','ArrowDown','ArrowRight','ArrowLeft','Enter'];

    if(game_started && valid_keys.includes(key_pressed) ){
        switch(key_pressed){
            case 'w':
            case 'ArrowUp':
                current_pos -= 10;
                if(current_pos < 0) current_pos += 80;
                break;
            case 's':
            case 'ArrowDown':
                current_pos += 10;
                current_pos %= 80;
                break;
            case 'a':
            case 'ArrowLeft':
                current_pos--;
                if(current_pos < 0) current_pos = 79;
                break;
            case 'd':
            case 'ArrowRight':
                current_pos++;
                current_pos %= 80;
                break;
            case 'Enter':
                check();
                return;
        }
        drawPosition();
    }
});

function check(){
    stopTimer();

    let current_attempt = (current_pos+codes_pos);
    current_attempt %= 80;

    if(game_started && current_attempt === correct_pos){
        streak++;
        if(streak > max_streak){
            max_streak = streak;
            document.cookie = "max-streak_hackingdevice="+max_streak;
        }
        let time = document.querySelector('.streaks .time').innerHTML;
        if(parseFloat(time) < best_time){
            best_time = parseFloat(time);
            document.cookie = "best-time_hackingdevice="+best_time;
        }
        let leaderboard = new XMLHttpRequest();
        leaderboard.open("HEAD", 'streak.php?streak='+streak+'&max_streak='+max_streak+'&time='+time);
        leaderboard.send();
        reset();
    }else{
        reset(false);
        current_pos = correct_pos-codes_pos;
        drawPosition('green', false);
    }
}

let moveCodes = () => {
    codes_pos++;
    codes_pos = codes_pos % 80;

    let codes_tmp = [...codes];
    for(let i=0; i<codes_pos; i++){
        codes_tmp.push(codes_tmp[i]);
    }
    codes_tmp.splice(0, codes_pos);

    let codesElem = document.querySelector('.minigame .codes');
    codesElem.innerHTML = '';
    for(let i=0; i<80; i++){
        let div = document.createElement('div');
        div.innerHTML = codes_tmp[i];
        codesElem.append(div);
    }

    drawPosition();
}

let getGroupFromPos = (pos, count = 4) => {
    let group = [pos];
    for(let i=1; i<count; i++){
        if( pos+i >= 80 ){
            group.push( (pos+i) - 80 );
        }else{
            group.push( pos+i );
        }
    }
    return group;
}

let drawPosition = (className = 'red', deleteClass = true) => {
    let toDraw = getGroupFromPos(current_pos);
    if(deleteClass){
        document.querySelectorAll('.minigame .codes > div.red').forEach((el) => {
            el.classList.remove('red');
        });
    }
    let codesElem = document.querySelectorAll('.minigame .codes > div');
    toDraw.forEach((draw) => {
        if(draw < 0) draw = 80 + draw;
        codesElem[draw].classList.add(className);
    });
}

let charGroupsSelected = () => {
    let charGroups = [];
    document.getElementsByName('char_group[]').forEach(el => {
        if(el.checked === true){
            charGroups.push(el.value);
        }
    });
    if(charGroups.length === 0) return false;

    return charGroups;
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
        start();
    }
}

function start(){
    codes_pos = 0;
    current_pos = 43;

    let charGroups = charGroupsSelected();
    if(charGroups === false)
        sets = -1;
    else{
        shuffle(charGroups);
        sets = charGroups[0];
    }

    let show_type = document.querySelector('input[name="show_type"]:checked').value;
    let hack = document.querySelector('.minigame .hack');
    switch(show_type){
        case '0':
            hack.classList.remove('mirrored');
            break;
        case '1':
            if( Math.round(Math.random()) === 1 )
                hack.classList.add('mirrored');
            else
                hack.classList.remove('mirrored');
            break;
        case '2':
            hack.classList.add('mirrored');
            break;
    }

    document.querySelector('.btn_again').blur();
    document.querySelector('.streak').innerHTML = streak;
    document.querySelector('.max_streak').innerHTML = max_streak;
    document.querySelector('.best_time').innerHTML = best_time;

    document.querySelector('.splash .text').innerHTML = 'PREPARING INTERFACE...';

    codes = [];
    for(let i = 0; i<80; i++){
        codes.push(randomSetChar()+randomSetChar());
    }
    correct_pos = random(0,80);
    to_find = getGroupFromPos(correct_pos);
    to_find = '<div>'+codes[to_find[0]]+'</div> <div>'+codes[to_find[1]]+'</div> '+
        '<div>'+codes[to_find[2]]+'</div> <div>'+codes[to_find[3]]+'</div>';

    let codesElem = document.querySelector('.minigame .codes');
    codesElem.innerHTML = '';
    for(let i=0; i<80; i++){
        let div = document.createElement('div');
        div.innerHTML = codes[i];
        codesElem.append(div);
    }

    document.querySelector('.minigame .hack .find').innerHTML = to_find;
    drawPosition();

    timer_start = sleep(1000, function(){
        document.querySelector('.splash .text').innerHTML = 'CONNECTING TO THE HOST';
        document.querySelector('.minigame .hack').classList.remove('hidden');

        timer_game = setInterval(moveCodes, 1500);

        game_started = true;

        let timeout = document.querySelector('#timeout').value;
        startTimer(timeout);
        timeout *= 1000;
        
        if( document.querySelector('#hide_chars').checked && random(1,4) === 1 ){
            timer_hide = setInterval(function(){
                document.querySelector('.minigame .hack .find').innerHTML = '';
            }, 3500);
        }
        
        timer_finish = sleep(timeout, function(){
            game_started = false;
            streak = 0;
            check();
        });
    });
}

function startTimer(timeout){
    timerStart = new Date();
    timer_time = setInterval(timer,1, timeout);
}
function timer(timeout){
    let timerNow = new Date();
    let timerDiff = new Date();
    timerDiff.setTime(timerNow - timerStart);
    let ms = timerDiff.getMilliseconds();
    let sec = timerDiff.getSeconds();
    if (ms < 10) {ms = "00"+ms;}else if (ms < 100) {ms = "0"+ms;}
    document.querySelector('.streaks .time').innerHTML = sec+"."+ms;
    let ms2 = (999-ms);
    if (ms2 > 99) ms2 = Math.floor(ms2/10);
    if (ms2 < 10) ms2 = "0"+ms2;
    document.querySelector('.hack .timer').innerHTML = (timeout-1-sec)+"."+ms2;
}
function stopTimer(){
    clearInterval(timer_time);
}
function resetTimer(){
    clearInterval(timer_time);
    document.querySelector('.streaks .time').innerHTML = '0.000';
}

start();