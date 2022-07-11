const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);  // filling the canvas with black

const gravity = 0.7;

const background = new Sprite({
    position:{
        x:0,
        y:0
    },
    imageSrc: './images/background.png'
});

const shop = new Sprite({
    position:{
        x:600,
        y:128
    },
    imageSrc: './images/shop.png',
    scale: 2.75,
    framesMax: 6
});

const player = new Player({
    position:{
        x: 0,
        y: 0
    },
    velocity:{
        x: 0,
        y: 0
    },
    offset:{
        x: 0,
        y: 0
    },
    imageSrc: './images/samuraiMack/Idle.png',
    framesMax: 8,
    scale: 2.5,
    offset:{
        x: 215,
        y: 157
    },
    sprites:{
        idle:{
            imageSrc: './images/samuraiMack/Idle.png',
            framesMax: 8
        },
        run:{
            imageSrc: './images/samuraiMack/Run.png',
            framesMax: 8
        },
        jump:{
            imageSrc: './images/samuraiMack/Jump.png',
            framesMax: 2
        },fall:{
            imageSrc: './images/samuraiMack/Fall.png',
            framesMax: 2
        },attack1:{
            imageSrc: './images/samuraiMack/Attack1.png',
            framesMax: 6
        },takeHit:{
            imageSrc: './images/samuraiMack/Take Hit - white silhouette.png',
            framesMax: 4
        },death:{
            imageSrc: './images/samuraiMack/Death.png',
            framesMax: 6
        }
    },
    attackBox:{
        offset:{
            x: 100,
            y: 50
        },
        width: 160,
        height: 50
    }
});

const enemy = new Player({
    position:{
        x: 400,
        y: 100
    },
    velocity:{
        x: 0,
        y: 0
    },
    color: 'blue',
    offset:{
        x: -50,
        y: 0
    },
    imageSrc: './images/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset:{
        x: 215,
        y: 167
    },
    sprites:{
        idle:{
            imageSrc: './images/kenji/Idle.png',
            framesMax: 4
        },
        run:{
            imageSrc: './images/kenji/Run.png',
            framesMax: 8
        },
        jump:{
            imageSrc: './images/kenji/Jump.png',
            framesMax: 2
        },fall:{
            imageSrc: './images/kenji/Fall.png',
            framesMax: 2
        },attack1:{
            imageSrc: './images/kenji/Attack1.png',
            framesMax: 4
        },takeHit:{
            imageSrc: './images/kenji/Take Hit.png',
            framesMax: 3
        },death:{
            imageSrc: './images/kenji/Death.png',
            framesMax: 7
        }
    },
    attackBox:{
        offset:{
            x: -150,
            y: 50
        },
        width: 170,
        height: 50
    }
})

// console.log(player);

const keys = {
    a:{
        pressed: false
    },
    d:{
        pressed: false
    },
    ArrowRight:{
        pressed: false
    },
    ArrowLeft:{
        pressed: false
    }
}

decreaseTimer();

function animate(){
    window.requestAnimationFrame(animate);    // which func we want to loop over and over again
    // console.log('Hello');
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    background.update();
    shop.update();
    c.fillStyle = 'rgba(255, 255, 255, 0.15)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    player.velocity.x=0;
    enemy.velocity.x=0;

    //Player Movement
    if(keys.a.pressed && player.lastKey==='a'){
        player.velocity.x=-5;
        player.switchSprite('run');
    }else if(keys.d.pressed && player.lastKey==='d'){
        player.velocity.x=5;
        player.switchSprite('run');
    }else{
        player.switchSprite('idle');
    }

    //Jumping
    if(player.velocity.y<0){
        player.switchSprite('jump');
    }else if(player.velocity.y>0){
        player.switchSprite('fall');
    }

    //Enemy Movement
    if(keys.ArrowLeft.pressed && enemy.lastKey==='ArrowLeft'){
        enemy.velocity.x=-5;
        enemy.switchSprite('run');
    }else if(keys.ArrowRight.pressed && enemy.lastKey==='ArrowRight'){
        enemy.velocity.x=5;
        enemy.switchSprite('run');
    }else{
        enemy.switchSprite('idle');
    }

    //Jumping
    if(enemy.velocity.y<0){
        enemy.switchSprite('jump');
    }else if(enemy.velocity.y>0){
        enemy.switchSprite('fall');
    }

    // Detect Collision for attack and enemy gets hit
    if(rectangularCollision({rectangle1:player,rectangle2:enemy})
        && player.isAttacking && player.framerCurrent===4){
        enemy.takeHit();
        player.isAttacking = false;
        // document.querySelector(".enemy-health-bar").style.width = enemy.health+'%';
        // console.log("Player Hit");
        gsap.to('.enemy-health-bar',{
            width: enemy.health+'%'
        });
    }

    //player misses
    if(player.isAttacking && player.framerCurrent===4){
        player.isAttacking = false;
    }

    // Detect Collision for attack and player gets hit
    if(rectangularCollision({rectangle1:enemy,rectangle2:player})
        && enemy.isAttacking && enemy.framerCurrent===2){
        enemy.isAttacking = false;
        player.takeHit();
        // document.querySelector(".player-health-bar").style.width = player.health+'%';
        // console.log("Enemy Hit");
        gsap.to('.player-health-bar',{
            width: player.health+'%'
        });
    }

    //enemy misses
    if(enemy.isAttacking && enemy.framerCurrent===2){
        enemy.isAttacking = false;
    }

    //end game based on health
    if(enemy.health<=0||player.health<=0){
        determineWinner({player,enemy,timerId});
    }
}

animate();

window.addEventListener('keydown',(event)=>{
    if(!player.dead){
        switch(event.key){
            case 'd': keys.d.pressed=true;
                player.lastKey = 'd';
                break;
            case 'a': keys.a.pressed=true;
                player.lastKey = 'a';
                break;
            case 'w': if(player.position.y===330)player.velocity.y=-20;
                break;
            case ' ': player.attack();
                break;
        }
    }
    if(!enemy.dead){
        switch(event.key){
            case 'ArrowRight':  keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft':  keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp': if(enemy.position.y===330)enemy.velocity.y=-20;
                break;
            case 'ArrowDown': enemy.attack();
                break;
        }
    }
    // console.log(event.key);
    // console.log(player.position.y,enemy.position.y);
});

window.addEventListener('keyup',(event)=>{
    switch(event.key){
        case 'd': keys.d.pressed=false;
            break;
        case 'a': keys.a.pressed=false;
            break;
    }

    // enemy keys
    switch(event.key){
        case 'ArrowRight': keys.ArrowRight.pressed=false;
            break;
        case 'ArrowLeft': keys.ArrowLeft.pressed=false;
            break;
    }
    // console.log(event.key);
});