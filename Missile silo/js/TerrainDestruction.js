class Terrain{
    constructor(x1,y1,x2,y2){
        this.rectangles=[];
        this.rectangles.push(new Box(x1,y1,x2,y2));
    }

    //#region MATH BASICS
    /**
     * return Point in Circle
     * @param {Point} P 
     * @param {Circle} C
    */
    pointCircle(P, C)
    {
        var x = C.x - P.x;
        var y = C.y - P.y;
        return x * x + y * y <= C.r * C.r;
    }
    /**
     * return Rectangle in Circle
     * @param {Rectangle} R 
     * @param {Circle} C
    */
    rectangleInsideCircle(R, C)
    {
        var lt=this.pointCircle( {x:R.x, y:R.y} , C )
        var rt=this.pointCircle( {x:R.x+R.w, y:R.y}, C)
        var rb=this.pointCircle( {x:R.x+R.w, y:R.y+R.h}, C)
        var lb=this.pointCircle( {x:R.x, y:R.y+R.h}, C)
        return (lt && rt && rb && lb);
    }
    /**
     * rectangle circle intersection
     * @param {Rectangle} R
     * @param {Circle} C 
     */
    rectangleCircle(R,C) 
    {
        var hw = R.w / 2;
        var hh = R.h / 2;
        var distX = Math.abs(C.x - (R.x + R.w / 2));
        var distY = Math.abs(C.y - (R.y + R.h / 2));

        if (distX > hw + C.r || distY > hh + C.r)
        {
            return false;
        }

        if (distX <= hw || distY <= hh)
        {
            return true;
        }

        var x = distX - hw;
        var y = distY - hh;
        return x * x + y * y <= C.r * C.r;
    }
    //#endregion

    /**
     * Add rectangle to the list
     * @param {rect} rect
     */
    addRectangle(rect){
        if (rect.area>this.minArea)
        this.rectangles.push(rect);
    }

    /**
     * Main function, performs the hit
     * Rectangles need to be bigger than minArea
     * @param {Circle} C 
     * @param {number} minArea 
     */
    hit(C,minArea){
        this.minArea=minArea;
    
        var n=0;
    
        while(n<this.rectangles.length)
        {
            b=this.rectangles[n];
            b.intersect=this.rectangleCircle(b,C);
            b.inside=this.rectangleInsideCircle(b,C);
            if (b.inside)
            {
                this.rectangles.splice(n,1);
                n--;
            }
            n++;
        }

        if (this.rectangles.length==0)
            return;
        n=0;
        var b=this.rectangles[0];
        b.intersect=this.rectangleCircle(b,C);

        while(n<this.rectangles.length)
        {
            var b=this.rectangles[n];

            if (b.intersect && b.area>minArea){
                b.intersect=false;

                var bw2=b.w/2;
                var bh2=b.h/2;

                //Left Top
                var b1=new Box(b.x,    b.y,    bw2,bh2);
                //Right Top
                var b2=new Box(b.x+bw2,b.y,    bw2,bh2);
                //Left Bottom
                var b3=new Box(b.x,    b.y+bh2,bw2,bh2);
                //Right Bottom
                var b4=new Box(b.x+bw2,b.y+bh2,bw2,bh2);

                b1.intersect=this.rectangleCircle(b1,C);
                b2.intersect=this.rectangleCircle(b2,C);
                b3.intersect=this.rectangleCircle(b3,C);
                b4.intersect=this.rectangleCircle(b4,C);

                b1.inside=this.rectangleInsideCircle(b1,C);
                b2.inside=this.rectangleInsideCircle(b2,C);
                b3.inside=this.rectangleInsideCircle(b3,C);
                b4.inside=this.rectangleInsideCircle(b4,C);
                if (!b1.inside && !b2.inside && !b1.intersect && !b2.intersect)
                {
                    var b1=new Box(b.x,b.y,b.w,bh2);
                    b1.inside=false;
                    b1.intersect=false;
                    this.addRectangle(b1);
                }
                else{
                    if (!b1.inside)
                        this.addRectangle(b1);
                    if (!b2.inside)           
                        this.addRectangle(b2);
                }
                if (!b3.inside && !b4.inside && !b3.intersect && !b4.intersect)
                {
                    var b1=new Box(b.x,b.y+bh2,b.w,bh2);
                    b1.inside=false;
                    b1.intersect=false;
                    this.addRectangle(b1);
                }
                else{
                    if (!b3.inside)           
                        this.addRectangle(b3);
                    if (!b4.inside)           
                        this.addRectangle(b4);
                }

                this.rectangles.splice(n,1);
            }
            else
                n++;
        }

        this.rectangles.sort(function(a,b){
            if (a.y<b.y)
            {
                return -1;
            }
            else
                if (a.y>b.y)
                {
                    return 1;
                }
                else
                {
                    if (a.x<b.x)
                        return -1;
                    else
                        return 1;
                }
            })

        n=0;
        while(n<this.rectangles.length-1)
        {
            b=this.rectangles[n];
            b2=this.rectangles[n+1];
            if (b.y==b2.y && b.h==b2.h && b2.x==b.x+b.w)
            {
                b.w+=b2.w;
                this.rectangles.splice(n+1,1);
            }
            n++;
        }

        this.rectangles.sort(function(a,b){
            if (a.x<b.x)
            {
                return -1;
            }
            else
                if (a.x>b.x)
                {
                    return 1;
                }
                else
                {
                    if (a.y<b.y)
                        return -1;
                    else
                        return 1;
                }
        })

        n=0;
        while(n<this.rectangles.length-1)
        {
            b=this.rectangles[n];
            b2=this.rectangles[n+1];
            if (b.x==b2.x && b.w==b2.w && b2.y==b.y+b.h)
            {
                b.h+=b2.h;
                this.rectangles.splice(n+1,1);
            }
            n++;
        }
    }
}

class Box{
    constructor(x,y,w,h){
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.area=w*h;
        this.intersect=false;
        this.inside=false;
    }

    drawCanvas(ctx){
        ctx.beginPath();
        if (this.intersect==true)
            ctx.strokeStyle="red";
        else
            ctx.strokeStyle="green";
        if (this.inside==true)
            ctx.strokeStyle="blue";
        ctx.rect(this.x,this.y,this.w,this.h);
        ctx.stroke();
    }
}

class Circle{
    constructor(x,y,r){
        this.x=x;
        this.y=y;
        this.r=r;
    }

    drawCanvas(ctx){
        ctx.beginPath();
        ctx.strokeStyle="black";
        ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
        ctx.stroke();       
    }
}
