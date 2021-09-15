let data;

// Generate selectors
let env = document.querySelector(".envelope .icon");
document.querySelectorAll('.envelope.add').forEach((el) => {
    el.prepend(env.cloneNode(true));
});
document.querySelectorAll('.position').forEach((el) => {
    el.append(env.cloneNode(true));
});

// Reset button
document.querySelector('button[type="reset"]').addEventListener('click', function() {
    document.querySelector('.group input').focus({preventScroll: true});
});

// Move focus of screens minigame and validate
document.querySelectorAll('.group input').forEach((el, index, elems) => {
    el.addEventListener("keyup", function(ev) {
        if(el.value !== ev.key){
            el.value = ev.key;
        }
        let re = new RegExp('^'+el.pattern+'{1}$');
        if(re.test(ev.key) === true){
            if(index < 19){
                elems[index+1].focus();
            }
            resolvePuzzle();
        }else{
            el.value = '';
        }
    });
});

let checkStart = index => {
    let order = [index+1];
    let count = 0;
    while( data[index] !== 0 && count < 7){
        count += 1;
        index += parseInt(data[index]);
        order.push(index+1);
    }
    return [count, order];
}
let resolvePuzzle = () => {
    data = [0,0,0,0,0,0,0,0];

    document.querySelectorAll('.group input').forEach((el) => {
        let change = 0;
        let re = new RegExp('^'+el.pattern+'{1}$');
        if(re.test(el.value) === true){
            switch(el.dataset.type){
                case 'up':
                    change-=(4*parseInt(el.value));
                    break;
                case 'down':
                    change+=(4*parseInt(el.value));
                    break;
                case 'left':
                    change-=parseInt(el.value);
                    break;
                case 'right':
                    change+=parseInt(el.value);
                    break;
            }
            data[el.dataset.group-1] += change;
        }else{
            document.querySelector('.solution_order').innerHTML = '?';
            return false;
        }
    });
    for(let i=0;i<=7;i++){
        let result = checkStart(i);
        if( result[0] === 7 ){
            document.querySelector('.solution_order').innerHTML = result[1].join(' &nbsp; ');
            return result[1];
        }else if(i === 7){
            document.querySelector('.solution_order').innerHTML = 'Wrong data';
        }
    }
    return false;
}

// Select group steam
document.querySelectorAll('.envelope.steam .icon').forEach((el, index, elems) => {
    el.addEventListener('change', (ev) => {
        let newIndex = ev.target.selectedIndex;
        for(let i=0; i<4; i++){
            if(i !== index){
                if(elems[i].selectedIndex !== newIndex) elems[i].selectedIndex = newIndex;
            }
        }
    });
});

// Select group phone
document.querySelectorAll('.envelope.phone .icon').forEach((el, index, elems) => {
    el.addEventListener('change', (ev) => {
        elems[index===0?1:0].selectedIndex = ev.target.selectedIndex;
    });
});

// Generate order
let validateAll = () => {
    document.querySelectorAll('.envelope .icon').forEach(el => {
        if(el.selectedIndex === 0) return false;
    });
    document.querySelectorAll('.group .icon').forEach(el => {
        if(el.selectedIndex === 0) return false;
    });
    document.querySelectorAll('.group input').forEach(el => {
        if(el.value === '') return false;
    });
    let screens = resolvePuzzle();
    if(screens === false) return false;
    
    return true;
}
let foundEnvelopes = (index) => {
    let envelopes = [];
    document.querySelectorAll('.envelope .icon').forEach((el, i)=> {
        if(el.selectedIndex === index){
            envelopes.push(i);
        }
    });
    if(envelopes.length === 0) return false;
    return envelopes;
}
let genOrder = () => {
    if( validateAll() === false ){
        return false;
    }
    let validatedScreenInfo = resolvePuzzle();
    document.querySelector('.minigames_verbose').innerHTML = '';
    
    let orderIcons = [];
    console.log(validatedScreenInfo);
    // 8   1   5   3   4   2   7   6
    validatedScreenInfo.forEach((order, index) => {
        let sel = document.querySelectorAll('.group .icon')[order-1];
        let div = document.createElement('div');

        let envelopes = foundEnvelopes(sel.selectedIndex);
        let envStr = '';
        if(envelopes !== false){
            envelopes.forEach(envelope => {
                let group = document.querySelectorAll('.envelope')[envelope];
                let select = group.querySelectorAll('select');
                envStr += '<span class="fa">'+select[1].value+'</span> ';
                if(select[2]){
                    envStr += '<span class="fa">'+select[2].value+'</span> ';
                }
            });
        }else{
            envStr = '<span style="color:red">Missing envelope</span>';
        }

        div.innerHTML = (index+1)+'º &nbsp; | &nbsp; '+order+' <span class="fa">&#xf3fa;</span> &nbsp; | &nbsp; '+
            '<span class="fa">'+sel.value+'</span> &nbsp; | &nbsp; '+envStr;

        document.querySelector('.minigames_verbose').append(div);

        orderIcons.push(sel.value);
    });

    document.querySelector('.minigames_order').innerHTML = '<span class="fa">'+orderIcons.join(' &nbsp; ')+'</span>';
}
document.querySelector('#generate_order').addEventListener('click', ev => {
    if( validateAll() === false ){
        document.querySelector('.minigames_order').innerHTML = 'Incomplete data';
        document.querySelector('.minigames_verbose').innerHTML = '';
        return false;
    }
    genOrder();
});
/*
// Prefill for test
let test_selects = [5,5,5,5,10,10,8,9,11,1,6,15,10,5,6,1,15,9,8,11];
document.querySelectorAll('.icon').forEach((el, index, elems) => {
    el.selectedIndex = test_selects[index];
});
let test_inputs = [0,1,1,1,0,1,0,0,0,2,1,2,0,0,0,0,0,1,1,3];
document.querySelectorAll('input').forEach((el, index, elems) => {
    el.value = test_inputs[index].toString();
});
genOrder();
*/