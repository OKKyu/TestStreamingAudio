/*
 * AudioBufPlayer.js version 0.1.1
 *   This code is audio player component what concreted by Vue.js.
 *   Feature of this component is below:
 *     ・It's playing music or sound from ArrayBuffer was putted in memory.
 *       And It recieve ArrayBuffer by Http Response or FileReader.
 *       You must implement reading audio data by FileReader on web client (example, javascript on browser, PHP...),
 *       otherwise sending http response from web server (example, Tomcat, Django, Flask...) with audio data.
 *     ・It's single component. If you want to use it, you simply create instance by new Vue().
 */
Vue.component('AudioBufPlayer',{
   props:['arybuf'],
   template:'<div class="audio-buf-player"> \
				 <span class="audio-buf-player-button start" v-bind:class="{ running:toggleRunning }" v-on:click="playAndPause"></span> \
				 <span class="audio-buf-player-button stop" v-on:click="stop"></span> \
				 <span class="audio-buf-player-bar"><span class="inner" v-bind:style="getProgressBarSize"></span></span> \
				 <span class="audio-buf-player-time">{{ drawViewTime }}</span> \
			  </div>',
   data: function(){
	   return {
		   stockAudBuf:null,
		   toggle:false,
		   source:null,
		   totalTime:'0:00',
		   initialCurTime:0,
		   currentTime:0,
		   duration:0,
		   setIntervalID:null,
		   viewTime:'',
		   progress:''
	   }
   },
   created:function(){
	   var self = this;
	   self.initializeSource();
   },
   computed:{
	   toggleRunning:function(){
		   var self = this;
		   return self.toggle;
	   },
	   drawViewTime:function(){
		   var self = this;
		   
		   //現在再生中の時間を計算
		   var curTime = new Date();
		   curTime.setTime((self.currentTime - self.initialCurTime) * 1000);
		   
		   //表示用時間に現在時間と合計時間を設定する
		   self.viewTime = curTime.getMinutes() + ":" + String(curTime.getSeconds()).padStart(2,"0") + "/" + self.totalTime;
		   
		   return self.viewTime;
	   },
	   getProgressBarSize:function(){
		   var self = this;
		   
		   //現在再生中の時間を計算
		   var curTime = new Date();
		   curTime.setTime((self.currentTime - self.initialCurTime) * 1000);
		   
		   //進捗バーの変更
		   var  progress = Math.floor(curTime.getTime() / 1000 / self.duration * 100);
		   //デバック
		   console.log(progress);
		   
		   if (isNaN(progress)){
			   return "width:0%;";
		   }else{
			   return "width:" + progress  + "%;";
		   }
	   }
	   
   },
   methods:{
	   initializeSource:function(){
		   var self = this;
		   
		   self.toggle = false;
		   self.source = null;
		   //進捗バーの描画イベントを停止する
		   window.clearInterval(self.setIntervalID);
	   },
	   playAndPause:function(){
		    var self = this
		    
			if (self.stockAudBuf == null) {
				alert("オーディオファイルが指定されていないか、読み込み中です。後でもう一度押下してみて下さい。");
			    return;
		    }
			
			if (self.source == null){
				//AudioContextの生成。
				var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
				// AudioBufferSourceNodeを生成する
				self.source = audioCtx.createBufferSource();
				// AudioBufferSourceNodeにバッファを設定する
				self.source.buffer = self.stockAudBuf;
				// AudioBufferSourceNodeを出力先に接続する
				self.source.connect(audioCtx.destination);
				// 音源の再生を始める  first:インターバル 2nd:再生開始位置
				self.source.start(0,0);
				self.toggle = true;
				
				// 合計時間を計算し保存する
				var duration = new Date();
				duration.setTime(self.source.buffer.duration * 1000);
				self.totalTime = duration.getMinutes() + ":" + String(duration.getSeconds()).padStart(2,"0");
				
				//durationの値もdataにコピーする
				self.duration = self.source.buffer.duration;
				
				//初期カレントタイムも保存しておく。なぜかゼロにならないため。
				self.initialCurTime = self.source.context.currentTime;
				self.currentTime = self.initialCurTime;
				
				//再生中に再生位置を表示させるイベントを登録
				self.setIntervalID = window.setInterval(function(){
				    //表示時間を変更する
				    self.currentTime = self.source.context.currentTime;
				}, 500);
				
				//再生完了時に表示項目を戻すイベントを登録
			    self.source.onended = function(){
					if (self.source != null){
                        //進捗バーの長さは最大にしておく。
					    //ちょっと強引だが、そのためにgetProgressBarSizeでwidth100%となるように値を入れておく
					    self.initialCurTime = 0;
		                self.currentTime = Math.floor(self.source.context.currentTime);
		                self.duration = Math.floor(self.source.context.currentTime);
						
						//初期化共通処理
					    self.initializeSource();
				    }
				    //コンソールに再生完了のお知らせを出力する。
				    console.log("AudioSourceNode had running completely. Play was finished.");
				};
				
			}else{
				if (self.toggle){
				    self.source.context.suspend();
				    self.toggle = false;
			    }else{
				    self.source.context.resume();
				    self.toggle = true;
				}
			}
		},
		stop:function(){
			var self = this;
			
			if (self.source != null && self.source != undefined){
			    self.source.stop();
			    self.initializeSource();
			    self.totalTime = '0:00';
		        self.initialCurTime = 0;
		        self.currentTime = 0;
		        self.duration = 0;
			}
	    }
   },
   watch:{
	   arybuf:function(newBuf, befBuf){
		    var self = this;
		    
		    //sourceがあれば、停止し初期化する。
		    if (self.source != null && self.source != undefined){
				self.stop();
			}
		    
		    // バッファを消しておく
		    self.stockAudBuf = null;
		    
		    //オーディオのバッファの取得
		    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		    
		   	audioCtx.decodeAudioData(newBuf).then(function (decodedBuffer){
				self.stockAudBuf = decodedBuffer;
			}).catch(function(error) {
				console.log(error);
				alert("バッファ読み込みでエラーが発生しました。ファイルが選択されているか確認して下さい。");
			});
	   }
   }
});
