String.prototype.paddingLeft = function (paddingValue) {
    return String(paddingValue + this).slice(-paddingValue.length);
};
 
let game;
var gameScene;

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: 0xffffff,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "gameCanvas",
            width: 256,
            height: 192
        },
        physics: {
            default: 'arcade',
            arcade: {
                tileBias:4,
                gravity: {y:100},
                debug: false
            }
        },
        scene: playGame,
        pixelArt:true
    }
    game = new Phaser.Game(gameConfig);
    window.focus()
}


class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    preload(){
        this.load.spritesheet("floor", "assets/sprites/floor.png", {
            frameWidth: 24,
            frameHeight: 4
        });
        this.load.spritesheet("player", "assets/sprites/player.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('font', 'assets/sprites/font.png', { 
            frameWidth: 8, 
            frameHeight: 8 
        });
        this.load.spritesheet('baddies', 'assets/sprites/baddies.png', { 
            frameWidth: 16, 
            frameHeight: 16 
        });
        this.load.spritesheet('lives', 'assets/sprites/lives.png', { 
            frameWidth: 8, 
            frameHeight: 8 
        });
    }
    create(){
        gameScene=this;
        this.score= 0;
        this.lives=3;
        this.liv=[];
        //#region anims
        this.anims.create({
            key: 'baddie1',
            frames: this.anims.generateFrameNumbers('baddies', {frames:[0,1,2,3,2,1] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'baddie2',
            frames: this.anims.generateFrameNumbers('baddies', {frames:[4,5,6,7,6,5] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'baddie3',
            frames: this.anims.generateFrameNumbers('baddies', {frames:[8,9,10,11,9,8] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'baddie4',
            frames: this.anims.generateFrameNumbers('baddies', {frames:[12,13] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'baddie5',
            frames: this.anims.generateFrameNumbers('baddies', {frames:[14,15] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'baddie6',
            frames: this.anims.generateFrameNumbers('baddies', {frames:[16,17,18,19,18,17] }),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: 'baddie7',
            frames: this.anims.generateFrameNumbers('baddies', {frames:[20,21,22,23,22,21] }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'playerwait',
            frames: this.anims.generateFrameNumbers('player', {frames:[0,1,0,2] }),
            frameRate: 2,
            repeat: -1
        });
        this.anims.create({
            key: 'playerleft',
            frames: this.anims.generateFrameNumbers('player', {frames:[4,5,6,7] }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'playerright',
            frames: this.anims.generateFrameNumbers('player', {frames:[11,10,9,8] }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'playerup',
            frames: this.anims.generateFrameNumbers('player', {frames:[12,13,14,14,15,15,15,13] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'playerupbonk',
            frames: this.anims.generateFrameNumbers('player', {frames:[16,17,18,17] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'playerko',
            frames: this.anims.generateFrameNumbers('player', {frames:[19,20,21,22] }),
            frameRate: 15,
            repeat: -1
        });
        //#endregion

        //DRAW THE PLATFORMS
        var platforms = this.physics.add.staticGroup();
        for(let y=0;y<=game.config.height/24;y++){
            for(let i=0;i<game.config.width/24;i++){
                platforms.create(i*24, y*24+2, "floor",0);
            }
        }

        this.displayLives();

        //DISPLAY SCORE
        this.savedData = localStorage.getItem("jjack") == null ? {
            score: 0
        } : JSON.parse(localStorage.getItem("jjack"));

        this.displayHiScore();
        this.displayScore();

        //CREATE PLAYER
        this.player=this.physics.add.sprite(15*8,7*24+12,"player",0);
        this.player.anims.play("playerwait",true);

        //CREATE HOLES
        this.holes = this.physics.add.group({
            defaultKey: 'floor',
            defaultFrame:1
        });
        this.addHole(-1,true);

        //CREATE BADDIES
        this.baddies = this.physics.add.group({
            defaultKey: 'baddies',
            defaultFrame:1
        });
        this.baddieNumber=0;
        // this.addBaddie(this.game.config.width,1,1);
        // this.addBaddie(this.game.config.width,2,2);
        // this.addBaddie(this.game.config.width,3,3);
        // this.addBaddie(this.game.config.width,4,4);
        // this.addBaddie(this.game.config.width,5,5);
        // this.addBaddie(this.game.config.width,6,6);
        // this.addBaddie(this.game.config.width,7,7);


        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.baddies, platforms);
        this.physics.add.collider(this.player, this.holes,this.fallDown);
        this.physics.add.collider(this.player, this.baddies, this.ohdear);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cursors = this.input.keyboard.createCursorKeys();

    }
    displayHiScore(){
        var ss=this.savedData.score.toString().paddingLeft("00000");
        if (!this.hiScoreChar){
            var sy=24*7+12;
            var x=19*8;
            this.add.image(x-2*8, sy, 'font',45, true,true ).setTint(0xff00dc);
            this.add.image(x-1*8, sy, 'font',46, true,true ).setTint(0xff00dc);
            this.hiScoreChar=[];
            for(let i=0;i<ss.length;i++){
                this.hiScoreChar[i]=this.add.image(x+i*8, sy, 'font',92-16*4+(ss[i]*1), true,true ).setTint(0xff00dc);
            }        
        }
        else
        {
            for(let i=0;i<ss.length;i++){
                this.hiScoreChar[i].setFrame(92-16*4+(ss[i]*1));
            }
        }
    }
    displayScore(){
        var ss=this.score.toString().paddingLeft("00000");
        if (!this.scoreChar){
            var sy=24*7+12;
            var x=27*8;
            this.add.image(x-2*8, sy, 'font',56, true,true ).setTint(0xff00dc);
            this.add.image(x-1*8, sy, 'font',40, true,true ).setTint(0xff00dc);
            this.scoreChar=[];
            for(let i=0;i<ss.length;i++){
                this.scoreChar[i]=this.add.image(x+i*8, sy, 'font',92-16*4+(ss[i]*1), true,true ).setTint(0xff00dc);
            }
        }
        else
        {
            for(let i=0;i<ss.length;i++){
                this.scoreChar[i].setFrame(92-16*4+(ss[i]*1));
            }
        }
        if (this.score>this.savedData.score){
            this.savedData.score=this.score;
            this.displayHiScore();
        }
    }
    PlayerKO(){
        if (!this.player.isko){
            this.player.isko=true;
            this.player.moveup=false;
            this.player.countMove=4*30;
            this.player.anims.play("playerko",true);
        }
        if (this.player.y>24*7 && !this.player.killcounted)
        {
            this.player.killcounted=true;
            this.PlayerLostLife()
        }
}
    ohdear(player,baddie){
        gameScene.PlayerKO();
    }
    fallDown(player,hole){
        if (Math.abs(player.x-hole.x)<=13)
        {
            if (player.moveup){
                //UP
                if (player.moveup && !player.moveupok){
                    player.moveupok=true;
                    gameScene.score+=50;
                    gameScene.displayScore();
                    if (player.y<16)
                    {
                        //add baddie
                        gameScene.baddieNumber++;
                        if (gameScene.baddieNumber>7)
                        gameScene.baddieNumber=1;
                        gameScene.addBaddie(gameScene.game.config.width,1,gameScene.baddieNumber);
                    }
                }
            }
            else
            {
                player.y+=6;
                gameScene.PlayerKO();
            }
        }
        return false;
    }
    addHole(dirX,forceTop){
        if (this.holes.getChildren().length<10){
            var x=Math.floor(Math.random()*(this.game.config.width-24))+12;
            var y=Math.floor(Math.random()*7);
            if (forceTop)
                y=0;
            var hole=this.holes.create(x,1+y*24);
            hole.vx=-dirX;
            hole.body.setAllowGravity(false);
            hole.body.immovable=true;
        }
    }
    addBaddie(x,y,n){
        var bad=this.baddies.create(x,y*24+8+12);
        bad.anims.play("baddie"+n,true);
        bad.vx=-1;
    }
    displayLives(){
        if (this.liv.length>0){
            for(let i=0;i<this.liv.length;i++){
                if (i>=this.lives)
                    this.liv[i].visible=false;
            }
        }
        else
        {
            this.liv=[];
            //DISPLAY LIVES
            for(let i=0;i<this.lives;i++){
                this.liv[i]=this.add.image(4+i*8,24*7+12,"lives");
            }
        }
        if (this.lives==0){
            localStorage.setItem("jjack",JSON.stringify({
                score: this.savedData.score
              }));
              this.add.text(game.config.width / 2-50, game.config.height / 2, "GAME OVER", {
                font: "bold 16px Arial",
                align: "center",
                fill: "#000000",
                stroke: "#ff0000",
                strokeThickness: 0
                });
            let timedEvent =  this.time.addEvent({
                delay: 7000,
                callbackScope: this,
                callback: function(){
                    this.scene.start("PlayGame");
                }
            });
    
        }
    }
    PlayerLostLife(){
        this.lives--;
        this.cameras.main.shake(500);
        this.displayLives();
    }
    update(){
        this.physics.world.wrap(this.player, 1, true);

        //HOLES
        this.holes.getChildren().forEach(function(hole) {
            hole.x+=hole.vx;
            if (hole.x-12>game.config.width && hole.vx>0)
            {
                hole.x=-24;
                hole.y+=24;
                if (hole.y>game.config.height){
                    hole.x=0;
                    hole.y=1;
                    this.addHole(hole.vx);
                }
            }
            else
                if (hole.x<-12 && hole.vx<0)
                {
                    hole.x=game.config.width+12;
                    hole.y-=24;
                    if (hole.y<0){
                        hole.x=game.config.width;
                        hole.y=24*7+1;
                        this.addHole(hole.vx);
                    }
                }

        }, this);
        
        //BADDIES
        this.baddies.getChildren().forEach(function(baddie) {
            baddie.x+=baddie.vx;
            if (baddie.x-12>game.config.width && baddie.vx>0)
            {
                baddie.x=-24;
                baddie.y+=24;
                if (baddie.y>game.config.height){
                    baddie.x=0;
                    baddie.y=1;
                }
            }
            else
            if (baddie.x<-12 && baddie.vx<0)
            {
                baddie.x=game.config.width+12;
                baddie.y-=24;
                if (baddie.y<0){
                    baddie.x=game.config.width;
                    baddie.y=24*6+8+12;
                }
            }

        }, this);

        if (!this.player.isko){

            if (this.player.moveup){
                if (this.player.y<=Math.floor(this.player.y/24)*24+8 && !this.player.moveupok)
                {
                    //CRASH
                    this.PlayerKO();
                }
                else
                    if (this.player.countMove<=6)
                        this.player.y-=2;
                this.player.countMove=this.player.countMove-0.5;
            }
            else
            {
                if (this.spaceKey.isDown)
                {
                    this.player.anims.play("playerup",false);
                    this.player.moveup=true;
                    this.player.countMove=8;
                    this.player.moveupok=false;
                }
                else
                {
        
                    if (this.cursors.left.isDown && !this.moveleft)
                    {
                        this.player.anims.play("playerleft",false);
                        this.player.countMove=8;
                        this.moveleft=true;
                    }
                    else
                        if (this.cursors.right.isDown && !this.moveright)
                        {
                            this.player.anims.play("playerright",false);
                            this.player.countMove=8;
                            this.moveright=true;
                        }
        
                    if (this.moveleft){
                        this.player.x-=1;
                        this.player.countMove--;
                    }
                    else
                        if (this.moveright){
                            this.player.x+=1;
                            this.player.countMove--;
                        }
                }
            }
            if (this.player.countMove<0){
                this.player.anims.play("playerwait",true);
            }
        }
        else
        {
            this.player.countMove--;
            if (this.player.countMove<0)
                this.player.countMove=0;
        }
        if (this.player.countMove==0){
            if (this.player.isko==true)
            {
                this.player.killcounted=false;
            }
            this.player.isko=false;
            this.player.countMove=-1;
            this.moveright=false;
            this.player.moveup=false;
            this.moveleft=false;
        }

    }
}