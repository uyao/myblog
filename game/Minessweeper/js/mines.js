Vue.component('piece',{
	template:'<div v-on:click="pieceEventCounter"></div>',
	methods:{
		pieceEventCounter:function(){
			console.log(1234)
			this.$emit('pe')
		}
	}
})
var piece={
	template:'<div v-on:click="pieceEventCounter"></div>',
	methods:{
		pieceEventCounter:function(){
			console.log(1234)
			this.$emit('pe')
		}
	}
}
new Vue({
	el:"#mines",
	data:{
		defaultLevel:{
			'9*9':{
				minesAmount:10,
				panelSize:{x:9,y:9}
			},
			'16*9':{
				minesAmount:30,
				panelSize:{x:16,y:9}
			}
		},
		pieceSide:40,
		gameData:null,
		mapData:null,
	},
	components:{
		'piece':piece,
	},
	computed:{
		getPieceSide(){
			return this.pieceSide+"px";
		}
	},
	methods:{
		exe(level){
			this.mapData=this.defaultLevel[level];
			this.init();
		},
		init(){
			console.log(123)
			var minesAmount=this.mapData.minesAmount;
			var panelSize=this.mapData.panelSize;
			var pieceAmount=panelSize.x*panelSize.y;
			var data=[];//数据
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
			this.gameData=data;
			console.log(this.gameData)
		},
		pieceEvent(){
			console.log(123)
		}
		
	}
})