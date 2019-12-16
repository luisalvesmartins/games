// Client script
// Load Images and start the game
var imagesLoaded=0;
var imageMap = new Image();
imageMap.src = "/public/assets/spritesheet.png";
imageMap.onload=function(){checkStart("imageMap")}
var carsMap = new Image();
carsMap.src = "/public/assets/cars.png";
carsMap.onload=function(){checkStart("carsMap")}
var endMap = new Image();
endMap.src = "/public/assets/end.png";
endMap.onload=function(){checkStart("endMap")}

var soundTheme = new Howl({
  src: ['/public/sound/theme.mp3'],
  loop: true
});
var soundIntro = new Howl({
  src: ['/public/sound/intro.mp3'],
});
var soundBang = new Howl({
  src: ['/public/sound/bang.mp3']
});
var soundFlag = new Howl({
  src: ['/public/sound/flag.mp3']
});

function checkStart(fileName){
  imagesLoaded++;
  document.all("messages").innerHTML+=fileName + " loaded.<br>";
  if (imagesLoaded==3)
  {
    if (window.location.href.indexOf("debug")<1)
      document.all("messages").style.display="none";
    else
      document.all("messages").style.display="block";
    var socket = io();
    var canvas = document.getElementById('canvas');
  
    Input.applyEventHandlers();
    Input.addMouseTracker(canvas);
  
    var game = Game.create(socket, canvas);
    game.init();
    game.animate();
    soundIntro.play();
  }
}