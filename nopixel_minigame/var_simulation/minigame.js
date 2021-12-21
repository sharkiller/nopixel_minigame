const random = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}
const range = (start, end, length = end - start + 1) => {
    return Array.from({ length }, (_, i) => start + i)
}
const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
let sleep = (ms, fn) => {return setTimeout(fn, ms)};

let timer_game, order, speed;
let numbers = 8;
let streak = 0;
let max_streak = 0;
let game_started = false;
let game_playing = false;

// Options
document.querySelector('#numbers').addEventListener('input', function(ev){
    document.querySelector('.numbers_value').innerHTML = ev.target.value;
    numbers = ev.target.value;
    streak = 0;
    reset();
});
document.querySelector('#speed').addEventListener('input', function(ev){
    document.querySelector('.speed_value').innerHTML = ev.target.value + 's';
});

// Resets
document.querySelector('.splash .btn_again').addEventListener('click', function() {
    streak = 0;
    reset();
});

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)
let getMaxStreakFromCookie = (n) => {
    let str = getCookieValue('max-'+n+'streak');
    if(str !== '') 
        return parseInt(str, 10);
    else
        return 0;
}

let validate = (ev) => {
    if(game_playing === false) return;
    
    if(parseInt(ev.target.dataset.number, 10) === order){
        ev.target.classList.add('good');
        order++;
        if(order > numbers){
            game_started = false;
            game_playing = false;
            streak++;
            if(streak > max_streak){
                max_streak = streak;
                document.cookie = "max-"+numbers+"streak="+max_streak;
            }
            reset();
        }
    }else{
        game_started = false;
        game_playing = false;
        streak = 0;
        
        ev.target.classList.add('bad');
        document.querySelector('.groups').classList.remove('playing');
        
        let btn = document.createElement('button');
        btn.classList.add('btn_again');
        btn.innerHTML = 'PLAY AGAIN';
        btn.addEventListener('click', reset);
        document.querySelector('.groups').append(btn);
    }
}

let reset = () => {
    clearTimeout(timer_game);

    max_streak = getMaxStreakFromCookie(numbers);

    document.querySelector('.streaks .streak').innerHTML = streak;
    document.querySelector('.streaks .max_streak').innerHTML = max_streak;
    
    document.querySelector('.splash').classList.add('hidden');
    document.querySelector('.groups').classList.remove('hidden','playing');
    document.querySelector('.groups').innerHTML = '';

    start();
}

let newPos = (element) => {
    let top = element.offsetTop;
    let left = element.offsetLeft;
    let new_top = random(10,755);
    let new_left = random(10,1420);
    let diff_top = new_top - top;
    let diff_left = new_left - left;
    let duration = random(10,40)*100;
    
    new mojs.Html({
        el: '#'+element.id,
        x: {
            0:diff_left,
            duration: duration,
            easing: 'linear.none'
        },
        y: {
            0:diff_top,
            duration: duration,
            easing: 'linear.none'
        },
        duration: duration+50,
        onComplete() {
            if(element.offsetTop === 0 && element.offsetLeft === 0) {
                this.pause();
                return;
            }
            element.style = 'top: '+new_top+'px; left: '+new_left+'px; transform: none;';
            newPos(element);
        },
        onUpdate() {
            if(game_started === false) this.pause();
        }
    }).play();
}

let start = () => {
    order = 1;
    game_started = true;
    game_playing = false;
    
    numbers = document.querySelector('#numbers').value;
    let nums = range(1, numbers);
    shuffle(nums);
    nums.forEach(function(num){
        let group = document.createElement('div');
        group.id = 'pos'+num;
        group.classList.add('group','bg'+random(1,9));
        group.dataset.number = num.toString();
        group.style.top = random(10,755)+'px';
        group.style.left = random(10,1420)+'px';
        group.innerHTML = num.toString();
        group.addEventListener('pointerdown', validate);
        document.querySelector('.groups').append(group);
    });
    document.querySelectorAll('.group').forEach(el => { newPos(el) });
    
    speed = document.querySelector('#speed').value;
    timer_game = sleep(speed * 1000, function(){
        document.querySelector('.groups').classList.add('playing'); 
        game_playing = true;
    });
}
