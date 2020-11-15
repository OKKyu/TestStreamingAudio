/*
 * TestStreamAudio.js version 0.1.0
 */
 
// For Purpose of avoiding global namespace pollution, We have main object.
var TestStreamAudioMain = {};
// Alias of main object.
var TSAM = TestStreamAudioMain

//
TSAM.player1 = new Vue({
                         el:'#AudioBufPlayer1',
                         data:{ arybuf:null }
                      });
                      
TSAM.getBuffer = function(){
  var self = this
  var soundName = document.getElementById("soundName");
  $.ajax({
      url: location.protocol + "//" + location.host + '/test/' + soundName.value,
      responseType:'json'
  }).done(function(result){
      
      //from base64 to binary
      var binary_string = window.atob(result.binary);
      var len = binary_string.length;
      var buffer = new ArrayBuffer(len);
      var bytes = new Uint8Array(buffer);
      for (var i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
      }
      self.player1.arybuf = bytes.buffer;
      
  }).fail(function(result){
      console.log(result.status + " " + result.statusText);
  });
};