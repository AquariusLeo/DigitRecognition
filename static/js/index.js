var canvas=document.getElementById('canvas');
var ctx=canvas.getContext('2d');
var tempcanvas=document.getElementById('tempCanvas');
var tempctx=tempcanvas.getContext('2d');
var bt_clear=document.getElementById('mnist-pad-clear');
var bt_submit=document.getElementById('mnist-pad-submit');
var pad_body=document.getElementById('pad_body');
var pad_result=document.getElementById('mnist-pad-result')

//画板尺寸自适应
getViewPort();

var linewid=15;
var movetime=0;
var prepointX=0;
var prepointY=0;
var curpointX=0;
var curpointY=0;
var paddingNum=40;  //截取轨迹时的内边距
var rect=canvas.getBoundingClientRect();   //使用此对象可获得canvas到视窗边框的距离

window.onload=function(){
    bt_submit.disabled=true;
    //===================建立websocket连接===============
    var host="ws://"+window.location.host+"/connect";
    var ws=new WebSocket(host);
    ws.onopen=function(){
        bt_submit.disabled=false;
    }
    ws.onmessage=function(event){
        var msg=event.data;
        pad_result.innerHTML=msg;
        alert("识别成功！\n结果： "+msg);
    }
    ws.onclose=function(){
        bt_submit.disabled=true;
        alert("服务器连接已断开，请检查服务器！");
    }
    //=====================画布监听事件===================
    canvas.addEventListener('touchstart',function(event){
        if (event.targetTouches.length==1){
            var touch=event.targetTouches[0];
            prepointX=touch.clientX - rect.left;
            prepointY=touch.clientY - rect.top;
            ctx.beginPath();
            ctx.lineWidth=linewid;
            ctx.lineCap="round";
            //手指移动
            canvas.addEventListener('touchmove',function(event){
                event.preventDefault();
                movetime++;
                var touche=event.targetTouches[0];
                //当手指第一次移动时，prepoint不需要改变
                if (movetime>1){
                    prepointX=curpointX;
                    prepointY=curpointY;
                }
                curpointX=touche.clientX - rect.left;
                curpointY=touche.clientY - rect.top;
                var midpointX=(prepointX + curpointX) / 2.0;
                var midpointY=(prepointY + curpointY) / 2.0;
                //当手指第一次移动时，画笔移动到起始点
                if (movetime==1){
                    ctx.moveTo(midpointX,midpointY);
                }
                //以后的每次移动，以前一个触摸点为控制点、中点为终点，绘制二次贝塞尔曲线
                else{
                    ctx.quadraticCurveTo(prepointX,prepointY,midpointX,midpointY);
                    ctx.stroke();
                }
            },false);
            canvas.addEventListener('touchend',function(event){
                //触摸结束时，把movetime计数器清零
                movetime=0;
            },false);
        }
    },false);

    //================清除按钮监听事件=====================
    bt_clear.addEventListener('click',function(event){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        pad_result.innerHTML="";
    });

    //================识别按钮监听事件=====================
    bt_submit.addEventListener('click',function(event){
        pad_result.innerHTML="识别中..."
        //寻找书写轨迹的左右上下边界
        var Data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
        var lOffset=canvas.width, rOffset=0, tOffset=canvas.height, bOffset=0;
        for (var i=0;i<canvas.width;i++){
            for (var j=0;j<canvas.height;j++){
                var pos = (i + canvas.width * j) * 4
                if (Data[pos] > 0 || Data[pos + 1] > 0 || Data[pos + 2] > 0 || Data[pos + 3] > 0) {
                    bOffset = Math.max(j, bOffset) // 找到有色彩的最底部的纵坐标
                    rOffset = Math.max(i, rOffset) // 找到有色彩的最右端的横坐标

                    tOffset = Math.min(j, tOffset) // 找到有色彩的最上端的纵坐标
                    lOffset = Math.min(i, lOffset) // 找到有色彩的最左端的横坐标
                }
            }
        }
        //为截取区域加上内边框
        lOffset -= paddingNum;
        tOffset -= paddingNum;
        rOffset += paddingNum;
        bOffset += paddingNum;
        console.log(lOffset, rOffset, tOffset, bOffset);
        //截取区域的宽度、高度
        var cutwidth=rOffset-lOffset;
        var cutheight=bOffset-tOffset;
        console.log(cutwidth,cutheight);
        var imageData;
        //截取区域高度>宽度，竖的矩形
        if (cutheight>cutwidth){
            if (cutheight<=canvas.width){   //截取区域高度<=画布宽度，以cutheight为边截取正方形
                imageData=ctx.getImageData(lOffset-(cutheight/2.0 - cutwidth/2.0), tOffset, cutheight, cutheight);
                imageData=scaleImageData(imageData,28/cutheight);
                console.log(1);
            }
            else{   //截取区域高度>画布宽度，截取canvas.width*cutheight的矩形
                imageData=ctx.getImageData(0, tOffset, canvas.width, cutheight);
                imageData=scaleImageData(imageData,28/cutheight);
                console.log(2);
            }
        }
        //截取区域宽度>=高度，横的矩形
        else{
            if (cutwidth<=canvas.height){   //截取区域宽度<=画布高度，以cutwidth为边截取正方形
                imageData=ctx.getImageData(lOffset, tOffset-(cutwidth/2.0-cutheight/2.0), cutwidth, cutwidth);
                imageData=scaleImageData(imageData,28/cutwidth);
                console.log(3);
            }
            else{   //书写区域宽度>画布高度，截取cutwidth*canvas.height的矩形
                imageData=ctx.getImageData(lOffset, 0, cutwidth, canvas.height);
                imageData=scaleImageData(imageData,28/cutwidth);
                console.log(4);
            }
        }
        //截取区域放入临时canvas
        tempctx.putImageData(imageData,0,0);
        //用websocket发送图片数据
        var sendData=tempctx.getImageData(0,0,28,28).data;
        var json={"imgData":sendData};
        var str=JSON.stringify(json);
        ws.send(str);
        //清除tempcanvas
        tempctx.clearRect(0,0,28,28);
    });
}

//画板尺寸自适应
function getViewPort(){
    var viewHeight=window.innerHeight || document.documentElement.clientHeight;
    var viewWidth=window.innerWidth || document.documentElement.clientWidth;
    document.body.style.width=viewWidth;
    canvas.width=viewWidth-34;
    canvas.height=viewHeight-101;
}

//Image对象缩放
function scaleImageData(imageData, scale) {
    var scaled = tempctx.createImageData(imageData.width * scale, imageData.height * scale);
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = [
                imageData.data[(row * imageData.width + col) * 4 + 0],
                imageData.data[(row * imageData.width + col) * 4 + 1],
                imageData.data[(row * imageData.width + col) * 4 + 2],
                imageData.data[(row * imageData.width + col) * 4 + 3]
            ];
            for (var y = 0; y < scale; y++) {
                var destRow = Math.floor(row * scale) + y;
                for (var x = 0; x < scale; x++) {
                    var destCol = Math.floor(col * scale) + x;
                    for (var i = 0; i < 4; i++) {
                        scaled.data[(destRow * scaled.width + destCol) * 4 + i] = sourcePixel[i];
                    }
                }
            }
        }
    }
    return scaled;
}