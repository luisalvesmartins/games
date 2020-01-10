String.prototype.paddingLeft = function (paddingValue) {
    return String(paddingValue + this).slice(-paddingValue.length);
 };
 
 const SPEED=3;
 const SIZE=32;
 const HALFSIZE=SIZE/2;
 
 var Machine=class{
     constructor(scene,x,y){
         this.machine=scene.physics.add.sprite(x,y,'machine',0);
     }
 }
 
 var Box= class{
     constructor(scene,x,y,num)
     {
         this.id=num;
         this.x=x;
         this.y=y;
         this.box = scene.physics.add.sprite(x, y, 'ground',2);
         this.unloading=false;
         this.available=false;
         this.load=0;
         this.explodeCounter=0;
         this.explodeStarted=false;
         this.angleDir=1;
         this.angle=0;
         this.scene=scene;
     }
 
     unload(){
         this.unloading=true;
         this.vx=1;
         this.vy=0;
     }
 
     update()
     {
         var returnOrder="";
         if (this.unloading){
             this.x+=this.vx;
             this.y+=this.vy;
             if (this.x>SIZE*2+HALFSIZE){
                 this.x=SIZE*2+HALFSIZE;
                 this.vx=0;
                 this.vy=1;
             }
             if (this.y>SIZE*13+HALFSIZE)
             {
                 this.y=SIZE*13+HALFSIZE;
                 this.vy=0;
                 this.unloading=false;
                 this.available=true;
                 this.explodeStarted=true;
                 returnOrder="offloaded";
             }
         };
 
         if (!this.grabbed){
             this.explodeStarted=true;
             var cell=getCell(this,0,1,-8,0);
             if (cell=="R")
             {
                 this.x++;
                 this.explodeStarted=false;
             }
             else
             {
                 cell=getCell(this,0,1,8,0);
                 if (cell=="L"){
                     this.x--;
                     this.explodeStarted=false;
                 }
             }
             var l=6-(this.y/SIZE-1.5)/2;
             if (l<0)
                 l=0;
             this.load=Math.floor(l);
             this.box.anims.play('box' + this.load, true);
         }
         else
         {
             this.explodeStarted=false;
             this.angleDir=1;
             this.angle=0;
         }
         if (this.explodeStarted){
             this.explodeCounter++;
             if (this.angle>10 || this.angle<-10)
                 this.angleDir=-this.angleDir;
             this.angle+=this.angleDir;
 //AQUI -> CONTADOR
             this.box.angle=this.angle;

             if (this.explodeCounter>300){
                 //LOSE LIFE
                 updateLives(-1);
                 returnOrder="exploded";
                 this.explodeCounter=0;
             }
         }
         else{
             this.box.angle=0;
             this.explodeCounter=0;
         }
 
         this.box.x=this.x;        
         this.box.y=this.y-4;        
         return returnOrder;
     }
 }
 
 var Player=class{
     constructor(scene,position){
         var sprite;
         if (position=="left")
         {
             this.level=5;
             this.x=SIZE*3+HALFSIZE;
             this.y=SIZE*13+HALFSIZE;
             sprite=4;
             this.anim="r";
             this.steps=[3,5,7,9,11,13];
         }
         else
         {
             this.level=0;
             this.x=SIZE*21+HALFSIZE;
             this.y=SIZE*2+HALFSIZE;
             sprite=0;
             this.anim="l";
             this.steps=[2,3,5,7,9,11];
         }
         this.grabbing=false;
         this.player = scene.physics.add.sprite(this.x, this.y, 'player', sprite);
     }
 
     update(dir){
         if (dir!=""){
             this.dir=dir;
         }
 
         var move=false;
         if (this.dir=="up" && this.y>SIZE*(this.steps[0])+HALFSIZE){
             this.y-=SPEED;
             this.player.anims.play('player' + this.anim + 'up', true);
             move=true;
             if (this.y<=SIZE*(this.steps[this.level-1])+HALFSIZE){
                 this.y=SIZE*(this.steps[this.level-1])+HALFSIZE;
                 this.level--;
                 this.dir="";
                 move=false;
             }
         }
         if (this.dir=="down" && this.y<SIZE*(this.steps[5])+HALFSIZE && !this.grabbing) {
             this.y+=SPEED;
             this.player.anims.play('player' + this.anim + 'down', true);
             move=true;
             if (this.y>=SIZE*(this.steps[this.level+1])+HALFSIZE){
                 this.y=SIZE*(this.steps[this.level+1])+HALFSIZE;
                 this.level++;
                 this.dir="";
                 move=false;
             }
         }
         if (!move)
             this.player.anims.play('player' + this.anim + 'wait', true);
 
         this.player.y=this.y-4;
     }
 }
 
 var Truck=class{
     constructor(scene,direction){
         var sprite=0;
         this.load=-1;
         this.direction=direction;
         if (direction=="left"){
             this.x=-100;
             this.y=SIZE*13-4;
             this.movingLeft=1;
             sprite=2;
         }
         else
         {
             this.x=24*SIZE+100;
             this.y=2*SIZE-4;
             this.movingLeft=-1;
             sprite=0;
         }
         this.canUnload=true;
         this.truck = scene.physics.add.sprite(this.x,this.y, 'truck',sprite);
     }
 
     update(){
         //load
         if (this.load!=-1){
             //LOADBOX
         }
         var returnOrder="";
         if (this.movingLeft!=0)
         {
             this.x+=this.movingLeft;
             if (this.direction=="left"){
                 if (this.x>SIZE){
                     this.x=SIZE;
                     this.movingLeft=0;
                     this.counting=0;
                     this.counter=0;
                 }
                 //OFFLOAD
                 if (this.x<-100){
                     this.movingLeft=1;
                     this.counter=0;
                     this.counting=0;
                 }
             }
             if (this.direction=="right"){
                 if (this.x<24*SIZE){
                     this.x=24*SIZE;
                     this.movingLeft=0;
                     //WAIT FOR LOAD
                 }
                 else
                     this.truck.anims.play('truckr', true);
 
             }
             this.truck.x=this.x;
         }
         if (this.x==SIZE && this.canUnload && this.counter==0){
             this.counting=1;
             this.counter=0;
             returnOrder="offload";
         }
 
         this.counter+=this.counting;
         if (this.counter>100){
             //should wait some cycles
             if (this.direction=="left")
                 this.movingLeft=-0.5;
             else
                 this.movingLeft=0.5;
             this.truck.anims.play('truckl', true);
         }
         return returnOrder;
     }
 }
 
 var Boxes=[];
 
 var plat;
 
 var config = {
     type: Phaser.AUTO,
     scale: 
     {
         mode: Phaser.Scale.FIT,
         autoCenter: Phaser.Scale.CENTER_BOTH,
         parent: "ph",
         width: SIZE*25,
         height: SIZE*15,
     },
     physics: {
         default: 'arcade',
         arcade: {
             gravity: false,
             debug: false
         }
     },
     scene: {
         preload: preload,
         create: create,
         update: update
     }
 };
 
 var game = new Phaser.Game(config);
 var playerl;
 var playerr;
 
 function preload ()
 {
     this.load.spritesheet('ground', 'Assets/sprites' + SIZE + '.png', { frameWidth: SIZE, frameHeight: SIZE });
     this.load.spritesheet('roller', 'Assets/roller' + SIZE + '.png', { frameWidth: 500, frameHeight: 34 });
     this.load.spritesheet('truck', 'Assets/truck' + SIZE + '.png', { frameWidth: SIZE*2, frameHeight: SIZE*2 });
     this.load.spritesheet('machine', 'Assets/machine' + SIZE + '.png', { frameWidth: SIZE*2, frameHeight: SIZE });
     this.load.spritesheet('player', 'Assets/player' + SIZE + '.png', { frameWidth: SIZE, frameHeight: SIZE });
     this.load.spritesheet('floor', 'Assets/floor' + SIZE + '.png', { frameWidth: SIZE, frameHeight: HALFSIZE });
     this.load.spritesheet('lives', 'Assets/lives.png', { frameWidth: 16, frameHeight: 16 });
     animplayerup=[8,9,10,9];
     animplayerdown=[11,12,13,12]
     animplayerrwait=[7,6,5,4,5,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7];
     animplayerlwait=[0,1,2,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
 }
 var rect1,rect2,rect3,rect4;
 function create ()
 {
     curGame=this;
     //#region anims
     this.anims.create({
         key: 'lives',
         frames: this.anims.generateFrameNumbers('lives',{ frames:[0,2,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}),
         frameRate: 5,
         repeat: -1
     });
     this.anims.create({
         key: 'truckr',
         frames: this.anims.generateFrameNumbers('truck',{ frames:[0,1]}),
         frameRate: 5,
         repeat: -1
     });
     this.anims.create({
         key: 'truckl',
         frames: this.anims.generateFrameNumbers('truck',{ frames:[2,3]}),
         frameRate: 5,
         repeat: -1
     });
 
     this.anims.create({
         key: 'playerlwait',
         frames: this.anims.generateFrameNumbers('player',{ frames:animplayerlwait}),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'playerrwait',
         frames: this.anims.generateFrameNumbers('player',{ frames:animplayerrwait}),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'playerlup',
         frames: this.anims.generateFrameNumbers('player',{ frames:animplayerup}),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'playerldown',
         frames: this.anims.generateFrameNumbers('player',{ frames:animplayerdown}),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'playerrup',
         frames: this.anims.generateFrameNumbers('player',{ frames:animplayerup}),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'playerrdown',
         frames: this.anims.generateFrameNumbers('player',{ frames:animplayerdown}),
         frameRate: 10,
         repeat: -1
     });    
     this.anims.create({
         key: 'rollerr',
         frames: this.anims.generateFrameNumbers('roller', { start: 0, end: 1 }),
         frameRate: 5,
         repeat: -1
     });
     this.anims.create({
         key: 'rollerl',
         frames: this.anims.generateFrameNumbers('roller', { start: 1, end: 0 }),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'box0',
         frames: this.anims.generateFrameNumbers('ground', { start: 2, end: 3 }),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'box1',
         frames: this.anims.generateFrameNumbers('ground', { start: 4, end: 5 }),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'box2',
         frames: this.anims.generateFrameNumbers('ground', { start: 6, end: 7 }),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'box3',
         frames: this.anims.generateFrameNumbers('ground', { start: 8, end: 9 }),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'box4',
         frames: this.anims.generateFrameNumbers('ground', { start: 10, end: 11 }),
         frameRate: 10,
         repeat: -1
     });
     this.anims.create({
         key: 'box5',
         frames: this.anims.generateFrameNumbers('ground', { start: 12, end: 13 }),
         frameRate: 10,
         repeat: -1
     });
     //#endregion
 
     //#region PLATFORMS
     //  The platforms group contains the ground and the 2 ledges we can jump on
     platforms = this.physics.add.staticGroup();
 
     plat=[
             'XXXXXXXXXXXXXXXXXXXXXXXXX',
             'XXXXXXXXXXXXXXXXXXXXX    ',
             'XXX        xx            ',
             'XXXS        M        SXXX' , 
             'XXXSRRRRRRRRRRRRRRRRRSXXX' , 
             'XXXS        M        SXXX' , 
             'XXXSLLLLLLLLLLLLLLLLLSXXX' , 
             'XXXS        M        SXXX' , 
             'XXXSRRRRRRRRRRRRRRRRRSXXX' , 
             'XXXS        M        SXXX' , 
             'XXXSLLLLLLLLLLLLLLLLLSXXX' , 
             'XXXS        M        SXXX' , 
             '   SRRRRRRRRRRRRRRRRRXXXX' , 
             '   SXXXXXXXXXXXXXXXXXXXXX' , 
             'XXXXXXXXXXXXXXXXXXXXXXXXX']; 
 
     grabPointsR=[SIZE*13+HALFSIZE, SIZE*9+HALFSIZE, SIZE*5+HALFSIZE]
     dropPointsR=[SIZE*11+HALFSIZE, SIZE*7+HALFSIZE, SIZE*3+HALFSIZE];
 
     grabPointsL=[SIZE*11+HALFSIZE, SIZE*7+HALFSIZE, SIZE*3+HALFSIZE]
     dropPointsL=[SIZE*9+HALFSIZE, SIZE*5+HALFSIZE, SIZE*2+HALFSIZE];
     //#endregion
 
     //  Now let's create some ledges
     for(var i=plat.length-1;i>=0;i--){
         var lastPlat="";
         for(var j=0;j<plat[i].length;j++){
             if (plat[i][j]=="X"){
                 if (i>0 && plat[i-1][j]!="X"){
                     platforms.create(j*SIZE+HALFSIZE, i*SIZE, 'floor',0,true,true );
                 }
                 platforms.create(j*SIZE+HALFSIZE, i*SIZE+HALFSIZE, 'ground',0,true,true );
             }
             if (plat[i][j]=="x")
                 platforms.create(j*SIZE+HALFSIZE, i*SIZE+HALFSIZE, 'ground',14,true,true );
             if (plat[i][j]=="S")
                 platforms.create(j*SIZE+HALFSIZE, i*SIZE+HALFSIZE-4, 'ground',1,true,true );
             if (plat[i][j]=="R")
             {
                 if (lastPlat!=plat[i][j]){
                     var roller = this.physics.add.sprite(j*SIZE+HALFSIZE+7*SIZE + HALFSIZE+HALFSIZE,i*SIZE+8-8, 'roller');
                     roller.anims.play('rollerr', true);
                 }
             }
             if (plat[i][j]=="L")
             {
                 if (lastPlat!=plat[i][j]){
                     var roller = this.physics.add.sprite(j*SIZE+SIZE+7*SIZE + HALFSIZE,i*SIZE+8-8, 'roller');
                     roller.anims.play('rollerl', true);
                 }
             }
             if (plat[i][j]=="M")
             {
                     var machine=new Machine(this,j*SIZE,i*SIZE);
             }
             lastPlat=plat[i][j];
         }
     }
     truck1=new Truck(this,"left");
     truck2=new Truck(this,"right");
 
     //#region player
     // // The player and its settings
     playerl=new Player(this,"left");
     playerr=new Player(this,"right");
 
     // //  Input Events
     cursors = this.input.keyboard.createCursorKeys();
     upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
     downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
     //#endregion
 
     var w=32*3;
     var h=32*3;
 
     //INPUT AREAS
     var graphics = this.add.graphics();
     graphics.fillStyle(0x000000, 0.3)
     rect1 = new Phaser.Geom.Rectangle(0, 32*4, w, h);
     graphics.fillRectShape(rect1);
 
     rect2 = new Phaser.Geom.Rectangle(0, 32*8, w, h ,0xff6699);
     graphics.fillRectShape(rect2);
 
     rect3 = new Phaser.Geom.Rectangle(32*22, 32*4, w, h ,0xff6699);
     graphics.fillRectShape(rect3);
     rect4 = new Phaser.Geom.Rectangle(32*22, 32*8, w, h ,0xff6699);
     graphics.fillRectShape(rect4);
 
     //LIVES
     this.lives=3;
     this.livespr=[]
     for(var i=0;i<this.lives;i++)
     {
         this.livespr[i]=this.add.sprite(16+i*18+8,16+16+4,"lives",0);
         this.livespr[i].anims.play("lives",true,i);
     }
 
     //SCORE
     this.score=0;
     this.txtScore=this.add.text(16,8,this.score.toString().paddingLeft("000000"),{
         font:"16px Arial",
         shadow: {
             offsetX: 1,
             offsetY: 1, color: '#000', fill:true
             }
     });
 }
 
 function updateScore(){
    curGame.txtScore.setText(curGame.score.toString().paddingLeft("000000"));
 }
 
 function updateLives(dir){
     if (dir==-1){
        curGame.cameras.main.shake(500);
        curGame.lives--;
        if (curGame.lives==0)
            gameOver=true;
     }
     for(var i=0;i<3;i++)
     {
         if (i>=curGame.lives){
            curGame.livespr[i].anims.stop();
            curGame.livespr[i].setFrame(1);
         }
     }
 }
 
 function getCell(child,dirX,dirY,roundX,roundY){
     var x=Math.floor((child.x-roundX)/SIZE);
     var y=Math.floor((child.y-roundY)/SIZE);
     var cell=plat[y+dirY][x+dirX];
     return cell;
 }
 
 
 var lastDir="left";
 var nBoxes=0;
 var gameOver=false;
 function update (time, delta)
 {
     if (gameOver)
     {
         return;
     }
     //this.input.enabled=true;
 
 //#region PLAYER MOVE
     var dir="";
     var dir2="";
     var pointer = this.input.activePointer;
     if (pointer.isDown) {
         var isInside = rect1.contains(pointer.x, pointer.y);
         if (isInside)
             dir="up";
         isInside = rect2.contains(pointer.x, pointer.y);
         if (isInside)
             dir="down";
         isInside = rect3.contains(pointer.x, pointer.y);
         if (isInside)
             dir2="up";
         isInside = rect4.contains(pointer.x, pointer.y);
         if (isInside)
             dir2="down";
     }
 
     if (cursors.up.isDown){
         dir2="up";
     }
     else
         if (cursors.down.isDown){
             dir2="down"
         }
     playerr.update(dir2);
 
     if (upKey.isDown){
         dir="up";
     }
     else
         if (downKey.isDown){
             dir="down"
         }
     playerl.update(dir);
 
 //#endregion
     
 //#region TRUCK MOVE
     var cant=true;
     Boxes.forEach(box=>{
         if (box.y==13*SIZE+HALFSIZE){
             cant=false;
         }
     })
     truck1.canUnload=cant;
 
     if (truck1.update()=="offload")
     {
         var box=new Box(this,truck1.x+HALFSIZE, truck1.y,nBoxes++);
         box.unload();
         Boxes.push(box);
     };
     truck2.update();
 //#endregion    

     let index=0;
     while (index<Boxes.length)
     {
        box=Boxes[index];
    //  Boxes.forEach(box=>{
 
         if (box.grabbed)
         {
             //DROP LEFT
             if (box.grabbedBy=="L"){
                 box.x=playerl.x;
                 box.y=playerl.y;
 
                 if (Math.abs(box.y-playerl.y)<5 && Math.abs(playerl.x-box.x)<50){
 
                     dropPointsR.forEach(gP=>{
                         if (Math.abs(gP-playerl.y)<2){
                             this.score+=10;
                             updateScore();
                             box.grabbed=false;
                             box.x=playerl.x+SIZE;
                             box.y=gP;
                             playerl.grabbing=false;
                         }
                     });
                 }
             }
             //DROP RIGHT
             if (box.grabbedBy=="R"){
                 box.x=playerr.x;
                 box.y=playerr.y;
 
                 if (Math.abs(box.y-playerr.y)<5 && Math.abs(playerr.x-box.x)<34){
 
                     dropPointsL.forEach(gP=>{
                         if (Math.abs(gP-playerr.y)<2){
                             this.score+=15;
                             updateScore();
 
                             box.grabbed=false;
                             //CHECK TOP EXIT
                             if (gP==SIZE*2+HALFSIZE)
                             {
                                 box.x=playerr.x+SIZE;
                                 truck2.load=box.id;
                             }
                             else
                                 box.x=playerr.x-SIZE;
                             box.y=gP;
                             playerr.grabbing=false;
                         }
                     });
                 }
             }
 
         }
 
         if (box.update()=="exploded")
         {
             box.box.destroy();
             Boxes.splice(index,1);
         }
         else
         {
            //GRAB BOX LEFT
            if (box.available && Math.abs(box.y-playerl.y)<5 && Math.abs(playerl.x-box.x)<34){
                grabPointsR.forEach(gP=>{
                    if (Math.abs(gP-playerl.y)<2){
                        box.grabbed=true;
                        box.grabbedBy="L";
                        playerl.grabbing=true;
                    }
                })
            }
            //GRAB BOX RIGHT
            if (box.available && Math.abs(box.y-playerr.y)<5 && Math.abs(playerr.x-box.x)<34){
                grabPointsL.forEach(gP=>{
                    if (Math.abs(gP-playerr.y)<2){
                        box.grabbed=true;
                        box.grabbedBy="R";
                        playerr.grabbing=true;
                    }
                })
            }
            index++;

         }

     }
 
     //check proximity
 
 }
 