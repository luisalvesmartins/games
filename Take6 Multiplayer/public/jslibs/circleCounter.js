var circleCounter={
    start:function(parentElement,animationDuration,borderThickness,callback){
        var _borderThickness=borderThickness || 40;

        var pE=document.getElementById(parentElement);
        pE.className="circleCounter";
        var name=pE.id || "circleCounter";
        circleCounter.name=name;
        pE.innerHTML='<div id="' + name + '_txt" class="circleCountercount">5</div>' + 
                    '<div id="' + name + '_l" class="circleCounterl-half"></div>'+
                    '<div id="' + name + '_r" class="circleCounterr-half"></div>';
        pE.style.boxShadow="inset 0 0 0 " + _borderThickness + "px rgba(255, 255, 255, 0.5)";

        var pE_txt=document.getElementById(name + "_txt");
        pE_txt.innerText=animationDuration;
        pE_txt.style.fontSize=borderThickness + "px";
        circleCounter._pseudoStyle(name + "_l","before","animation-duration",animationDuration + "s");
        circleCounter._pseudoStyle(name + "_l","before","border-width",_borderThickness + "px");
        circleCounter._pseudoStyle(name + "_r","before","animation-duration",animationDuration + "s");
        circleCounter._pseudoStyle(name + "_r","before","border-width",_borderThickness + "px");

        circleCounter.n = animationDuration - 1;

        circleCounter._counterList.push({n:animationDuration-1, t:circleCounter.name+"_txt"})
        circleCounter._callbacks.push(callback);

        if (circleCounter._counterList.length==1)
            circleCounter.counter=setInterval(function() {
                var active=true;
                for (let index = 0; index < circleCounter._counterList.length; index++) {
                    const element = circleCounter._counterList[index];
                    if (element.n>=0)
                    {
                        document.getElementById(element.t).innerText=element.n--;
                        if (element.n<0){
                            if (circleCounter._callbacks[index])
                                circleCounter._callbacks[index]();
                        }
                        active=true;
                    }
                }
                if (!active)
                {
                    circleCounter.stop();
                }
            }, 1000);
    },
    stop:function(){
        circleCounter._counterList=[];
        clearInterval(circleCounter.counter);
        circleCounter.counter=null;
    },
    _counterList:[],
    _callbacks:[],
    _current: 0,
    _pseudoStyle:function(name,element,prop,value){
        var _this=document.getElementById(name)
        var _sheetId = "pseudoStyles";
        var _head = document.head || document.getElementsByTagName('head')[0];
        var _sheet = document.getElementById(_sheetId) || document.createElement('style');
        _sheet.id = _sheetId;
        circleCounter._current++;
        var className = "pseudoStyle" + circleCounter._current;
        
        _this.className +=  " "+className; 
        
        _sheet.innerHTML += " ."+className+":"+element+"{"+prop+":"+value+"}";
        _head.appendChild(_sheet);
        return this;
    }
}
