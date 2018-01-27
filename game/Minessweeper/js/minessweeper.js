new Vue({
	el:"#i_wrapper",
	data:{
		level_data:[
			{
				isDefault:1,
				level:"简单",
				byname:"9*9",
				icon:"&#xe63f;",
			},
			{
				isDefault:1,
				level:"中等",
				byname:"16*16",
				icon:"&#xe86c;",
			},
			{
				isDefault:1,
				level:"困难",
				byname:"30*16",
				icon:"&#xe64a;",
			},
			{
				isDefault:0,
				level:"自定义",
				byname:"",
				icon:"&#xe647;",
			}
		],
		defaultPanelSize:{
			"9*9":{
				panelSize:{x:9,y:9},
				minesAmount:9,
			},
			"16*16":{
				panelSize:{x:16,y:16},
				minesAmount:40,
			},
			"30*16":{
				panelSize:{x:30,y:16},
				minesAmount:98,
			},
		},
		pieceSide:40,
		transformScaleValue:1,
		menuIsExpand:false,
		gameCtrlIsExpand:false,
		gameOverMsg:"",
		gameStatus:0,
		/*
		0 noRun 未运行
		1 running 运行中
		2 paused 暂停
		3 gameOver 结束
		4 noSelect 不可选
		*/
		flags:0,
		time:"00:00",
		rTimer:null,
		wheel:null,
		recordTimer:null,
		recordDownTime:0,
		recordUpTime:0,
		cIndex:-1,
		minesConIsActive:false,
		// pieceIsClick:false,
		mapData:null,
		gameData:null,
		originalGameData:null,
		mousedownTime:0,
		mouseupTime:0,
	},
	computed:{
		byNameStrReplace(){
			
		},
		computeConWidth(){
			if(this.mapData){
				return this.pieceSide*this.mapData.panelSize.x +"px";
			}else{
				return 0;
			}
		},
		computeConHeight(){
			if(this.mapData){
				return this.pieceSide*this.mapData.panelSize.y +"px";
			}else{
				return 0;
			}
		},
		computeGameOverMsg(){
			if(this.gameStatus==3){
				return true;
			}else{
				return false;
			}
		},
		transformScale(x){
			return 'scale('+this.transformScaleValue+')';
		},
	},
	components:{
	},
	created(){
		this.rTimer=this.reckonTime();
	},
	methods:{
		reckonTime(){
			var $vue=this;
			var s=0,m=0,timer=null;
			var rTime=function(){}
			rTime.prototype.init=function(){
				this.paused();
				m=0;s=0;
				this.padding(m,s)
			}
			rTime.prototype.start=function(){
				var $this=this;
				this.paused();
				timer=setInterval(function(){
					if((s+1)%60==0){
						if((m+1)%60==0){
							$this.paused();
						}else{
							m++;
							s=0;
						}
					}else{
						s++;
					}
					$this.padding(m,s);
				},1000)
			}
			rTime.prototype.paused=function(){
				clearInterval(timer);
			}
			rTime.prototype.padding=function(m,s){
				var new_m,new_s;
				s<10? new_s='0'+s : new_s=s;
				m<10? new_m='0'+m : new_m=m;
				$vue.time = new_m+':'+new_s;
			}
			rTime.prototype.restart=function(){
				this.init()
				this.start();
			}
			return new rTime();
		},
		menuToggle(){
			this.menuIsExpand=!this.menuIsExpand;
		},
		gameCtrlToggle(){
			this.gameCtrlIsExpand=!this.gameCtrlIsExpand;
		},
		scaleCompute(wEvent){
			if(wEvent.deltaY>0){
				this.transformScaleValue-=0.04;
			}else if(wEvent.deltaY<0){
				this.transformScaleValue+=0.04;
			}
		},
		startGame(level){
			this.gameStatus=1;
			this.rTimer.restart();
			this.exe(level);
			this.dynamicScale();
		},
		dynamicScale(){
			var gameBody=this.$refs.gameBody;
			var panelSize=this.mapData.panelSize;
			var pieceSide=this.pieceSide;
			var gbWidth=gameBody.clientWidth;
			var gbHeight=gameBody.clientHeight;
			var realityWidth=pieceSide*panelSize.x;
			var realityHeight=pieceSide*panelSize.y;

			var scale=1;
			var scale1=scale2=scale;
			if(realityWidth > gbWidth-100){
				scale1=Math.round(((gbWidth-100)/realityWidth) *100)/100;
			}
			// console.log(scale1)
			if(realityHeight > gbHeight-100){
				scale2=Math.round(((gbHeight-100)/realityHeight) *100)/100;
			}
			// console.log(scale2)
			scale1>scale2 ? scale=scale2 : scale=scale1;
			// console.log(scale)
			if(scale){
				this.transformScaleValue=scale;
			}
		},
		gameCtrl(act){
			if(act=='new'){
				this.init();
				this.rTimer.restart();
				this.gameStatus=1;
			}else if(act=='paused'){
				this.gameStatus=2;
				this.rTimer.paused();
			}else if(act=='start'){
				this.gameStatus=1;
				this.rTimer.start();
			}else if(act=='restart'){
				this.gameData=JSON.parse(JSON.stringify(this.originalGameData));
				this.gameStatus=1;
			}else if(act=='close'){
				this.gameStatus=0;
				this.gameData=null;
				this.originalGameData=null;
			}
		},
		exe(level){
			if(level.isDefault){
				this.mapData=this.defaultPanelSize[level.byname];
			}
			this.init();
		},
		init(){
			var minesAmount=this.mapData.minesAmount;
			var panelSize=this.mapData.panelSize;
			var pieceAmount=panelSize.x*panelSize.y;
			var data=[];//数据
			this.flags=minesAmount;
			for(var i=0;i<pieceAmount;i++){
				var tempObj={
					pieceState:0,
					isMines:0,
					index:0,
					html:""
				}
				if(minesAmount>0){
					tempObj.isMines=1;
					minesAmount--;
				}else{
					tempObj.isMines=0;
				}
				data.push(tempObj);
			}
			//打乱数据
			data.sort(function(){return 0.5-Math.random()});
			//将游戏数据复制分别保存
			for(var i=0;i<data.length;i++){
				data[i].index=i
			}
			this.gameData=JSON.parse(JSON.stringify(data));
			this.originalGameData=JSON.parse(JSON.stringify(data));
		},
		contextFun(index){
			if(this.gameStatus!=1)return false;
			var $pieceState=this.gameData[index].pieceState;
			if($pieceState<=0){
				$pieceState--;
				$pieceState<-2?$pieceState=0:$pieceState;
			}
			this.gameData[index].pieceState=$pieceState;
			this.variance();
		},
		mouseLeft(index){			
			if(this.gameStatus!=1)return false;
			var $pieceState=this.gameData[index].pieceState;
			var $isMines=this.gameData[index].isMines;
			var intervalTime=this.recordUpTime-this.recordDownTime;
			console.log(intervalTime)
			if(intervalTime>1000)return false;
			if(intervalTime<0)return false;
			if($pieceState==0){//是否为初始状态
				if($isMines==1){//是否是炸弹
					console.log("game over")
					this.gameOver(0,index)
				}else{
					this.minesCompute(index);
					this.variance();
				}
			}
			this.recordDownTime=0;
			this.recordUpTime=0;
			this.cIndex=-1
		},
		pieceMouseDown(index){//@click="mouseLeft(piece.index)"
			var date=new Date();
			var recordTime=date.getTime();
			this.recordDownTime=recordTime;
			this.cIndex=index;
			// console.log(this.recordDownTime)
			// console.log(this.cIndex)
		},
		pieceMouseUp(index){
			var date=new Date();
			var recordTime=date.getTime();
			if(this.cIndex==index){
				this.recordUpTime=recordTime;
				// console.log(this.recordUpTime-this.recordDownTime)
				this.mouseLeft(index)
			}else{
				this.recordUpTime=0;
				this.cIndex=-1;
			}
		},
		minesCompute(currIndex){
			var gameData=this.gameData;
			var mapData=this.mapData;
			var panelSizeX=mapData.panelSize.x;
			var panelSizeY=mapData.panelSize.y;
			// 修改当前位置的小方块状态，然后计算
			gameData[currIndex].pieceState=1;
			compute(currIndex);
			function compute(currIndex){
				var pieceX=currIndex%panelSizeX;//元素横坐标
				var pieceY=Math.floor(currIndex/panelSizeX);//元素竖坐标	
				var arr=[];
				//左上角坐标
				var leftTop={"x":pieceX-1,"y":pieceY-1};
				if(leftTop.x >= 0 && leftTop.y >= 0 && gameData[leftTop.x+leftTop.y*panelSizeX].pieceState != 1){
					arr.push(leftTop);
				}
				// 中上坐标
				var centerTop={"x":pieceX,"y":pieceY-1};
				if(centerTop.y >= 0 && gameData[centerTop.x+centerTop.y*panelSizeX].pieceState != 1){
					arr.push(centerTop);
				}
				// 右上角坐标
				var rightTop={"x":pieceX+1,"y":pieceY-1};
				if(rightTop.x < panelSizeX && rightTop.y >= 0 && gameData[rightTop.x+rightTop.y*panelSizeX].pieceState != 1){
					arr.push(rightTop);
				}
				// 右中坐标
				var rightCenter={"x":pieceX+1,"y":pieceY};
				if(rightCenter.x < panelSizeX && gameData[rightCenter.x+rightCenter.y*panelSizeX].pieceState != 1){
					arr.push(rightCenter);
				}
				//右下角坐标
				var rightBottom={"x":pieceX+1,"y":pieceY+1};
				if(rightBottom.x < panelSizeX && rightBottom.y < panelSizeY && gameData[rightBottom.x+rightBottom.y*panelSizeX].pieceState != 1){
					arr.push(rightBottom);
				}
				// 中下坐标
				var centerBottom={"x":pieceX,"y":pieceY+1};
				if(centerBottom.y < panelSizeY && gameData[centerBottom.x+centerBottom.y*panelSizeX].pieceState != 1){
					arr.push(centerBottom);
				}
				//左下角坐标
				var leftBottom={"x":pieceX-1,"y":pieceY+1};
				if(leftBottom.x >= 0 && leftBottom.y < panelSizeY && gameData[leftBottom.x+leftBottom.y*panelSizeX].pieceState != 1){
					arr.push(leftBottom);
				}
				// 左中坐标
				var leftCenter={"x":pieceX-1,"y":pieceY};
				if(leftCenter.x >= 0 && gameData[leftCenter.x+leftCenter.y*panelSizeX].pieceState != 1){
					arr.push(leftCenter);
				}
				//空数组就直接返回
				if(arr.length==0) return false;
				// 计算周围炸弹数
				var count=0;
				var x,y,arr1=[];
				for(var i=0;i<arr.length;i++){
					x=arr[i].x;
					y=arr[i].y;
					if(gameData[x+y*panelSizeX].isMines == 1){
						count++;
					}
					if(gameData[x+y*panelSizeX].pieceState == 0){
						arr1.push(arr[i]);
					}
				}
				// 周围若有炸弹分别执行相应操作
				if(count){
					gameData[currIndex].html=count;
				}else{
					if(arr1.length==0) return false;
					for(var i=0;i<arr1.length;i++){
						x=arr1[i].x;
						y=arr1[i].y;
						gameData[x+y*panelSizeX].pieceState=1;
					}
					for(var i=0;i<arr1.length;i++){
						x=arr1[i].x;
						y=arr1[i].y;
						compute(x+y*panelSizeX);
					}
				}
			}
		},
		minesConMouseDown(e){
			var $this=this;
			var date=new Date();
			var recordTime=date.getTime();
			var minesCon=this.$refs.minesCon;
			clearTimeout(this.recordTimer);
			this.recordTimer=setTimeout(function(){
				$this.minesConIsActive=true;
				//鼠标按下，计算当前元素距离可视区的距离
            let disX = e.clientX - minesCon.offsetLeft;
            let disY = e.clientY - minesCon.offsetTop;
            document.onmousemove = function (e) {
               //通过事件委托，计算移动的距离 
               let l = e.clientX - disX;
               let t = e.clientY - disY;
               //移动当前元素  
               minesCon.style.left = l + 'px';
               minesCon.style.top = t + 'px';
            };
            document.onmouseup = function (e) {
            	$this.minesConIsActive=false;
            	document.onmousemove = null;
               document.onmouseup = null;
            };
			},1000)
		},
		minesConMouseUp(){
			clearTimeout(this.recordTimer);
		},
		// [variance 过关检测，插旗计算] 
		variance(){
			var gameData=this.gameData;
			var minesAmount=this.mapData.minesAmount;
			var count=0,flags=0;
			for(var i=0;i<gameData.length;i++){
				var pieceState=gameData[i].pieceState;
				if(pieceState!=1){
					count++;
				}
				if(pieceState==-1){
					flags++;
				}
			}
			if(count==minesAmount){
				this.gameOver(1);
			}
			this.flags=minesAmount-flags;
		},
		// [gameOver 游戏结束，计算数据显示方块状态] code:0失败/1胜利;
		gameOver(code,currIndex){
			this.rTimer.paused();	
			currIndex ? currIndex : currIndex=null;
			var gameData=this.gameData;
			for(var i=0;i<gameData.length;i++){
				var tempGameData=gameData[i];
				var tempIsMines=tempGameData.isMines;
				var tempPieceState=tempGameData.pieceState;
				var tempStateCode=0;
				if(i==currIndex){
					tempStateCode=3;
				}else{
					if(tempIsMines){
						if(tempPieceState==-2 || tempPieceState==0){
							tempStateCode=2;
						}else if(tempPieceState==-1){
							tempStateCode=4;
						}
					}else{
						if(tempPieceState==-2){
							tempStateCode=0;
						}else if(tempPieceState==-1){
							tempStateCode=5;
						}else if(tempPieceState==1){
							tempStateCode=1;
						}
					}
				}
				tempGameData.pieceState=tempStateCode;
			}
			if(code){
				console.log("win");
			}else{
				console.log("lost");
			}
			this.gameOverMsgFun(code);
		},
		gameOverMsgFun(code){
			var msg="";
			if(code){
				msg="you win !";
			}else{
				msg="you lost !";
			}
			this.gameOverMsg=msg;
			this.gameStatus=3;
		},
		pieceView($pieceState){
			// var $pieceState=this.gameData[index].pieceState;
			var className="";
			switch($pieceState){
				case -2:// -2 问号
					className="query";break;
				case -1:// -1 插了旗帜
					className="flag";break;
				case 0:// 0 初始状态 
					className="";break;
				case 1:// 1 点击后的状态
					className="piece_clicked";break;
				case 2:// 2 有炸弹，炸弹没有爆炸
					className="mines";break;
				case 3:// 3 有炸弹，炸弹爆炸
					className="mines_boom";break;
				case 4:// 4 有炸弹，插了旗帜
					className="mines_delete";break;
				case 5:// 5 没有炸弹，插了旗帜
					className="delete";break;
				default:
					className="";
			}
			return className;
		}
	},
	directives:{
		'drag':{
			inserted:function (el,binding) {
				console.log(this)
            let oDiv = el;   //当前元素
            let self = this;  //上下文
				oDiv.onmousedown = function (e) {
              //鼠标按下，计算当前元素距离可视区的距离
               let disX = e.clientX - oDiv.offsetLeft;
               let disY = e.clientY - oDiv.offsetTop;
               document.onmousemove = function (e) {
                  //通过事件委托，计算移动的距离 
                  let l = e.clientX - disX;
                  let t = e.clientY - disY;
                  //移动当前元素  
                  oDiv.style.left = l + 'px';
                  oDiv.style.top = t + 'px';
               };
               document.onmouseup = function (e) {
               	document.onmousemove = null;
                  document.onmouseup = null;
               };
            };
	            
         }
		}
	}
});