// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var height = $("#wrapper").height()
var width = $("#wrapper").width()


var player1;
var player2;
var player3;
var playerStarted = false;


function onYouTubeIframeAPIReady() {
player1 = new YT.Player('player1', {
  height: height,
  width: width,
  videoId: 'VEPbSInoiKc',
  playerVars: {'controls': 0,
               'showinfo': false,
               'disablekb': true  },
  events: {
    'onReady': onPlayerReady  }
});

player2 = new YT.Player('player2', {
  height: height,
  width: width,
  videoId: 'OoxgzAlpwsc',
  playerVars: {'controls': 0,
               'showinfo': false,
               'disablekb': true },
  events: {
    'onReady': onPlayerReady 
  }
});


player3 = new YT.Player('player3', {
  height: height,
  width: width,
  videoId: 'DYpzrLC0y8M',
  playerVars: {'controls': 0,
               'showinfo': false,
               'disablekb': true },
  events: {
    'onReady': onPlayerReady 
  }
});

}

videoReadyCount = 0
numberOfVideos = 3

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  videoReadyCount += 1
  console.log(videoReadyCount)
  if (videoReadyCount == numberOfVideos){
    console.log("all ready")
    $("#player2").hide()
    $("#player3").hide()

    player1.playVideo()
    player2.playVideo()
    player3.playVideo()
    player1.unMute()
    player2.mute()
    player3.mute()

    playerStarted = true;


  }
}


document.onkeydown = function (e) {
  if(playerStarted){
    var keyPress;

    console.log(e.which)

    switch(e.which){
    	case 49:
    		//Video 1
        $("#player1").show()
        $("#player2").hide()
        $("#player3").hide()
        player1.unMute()
        player2.mute()
        player3.mute()
    		break


      case 50:
        //Video 2
        $("#player1").hide()
        $("#player2").show()
        $("#player3").hide()
        player1.mute()
        player2.unMute()
        player3.mute()
        break

         break
      
      case 51:
        //Video 3
        $("#player1").hide()
        $("#player2").hide()
        $("#player3").show()
        player1.mute()
        player2.mute()
        player3.unMute()
        break
    }
  }

  return false;   // Prevents the default action
};


$("#wrapper").click(function(){
  console.log("test")

})


function checkSynchronization(){
  if(playerStarted){
    p1Time = player1.getCurrentTime()
    p2Time = player2.getCurrentTime()
    p3Time = player3.getCurrentTime()
    console.log(p1Time)

    threshold = 0.3

    if(Math.abs(p1Time - p2Time) > threshold){
      player2.seekTo(p1Time, true)
    }

    if(Math.abs(p1Time - p3Time) > threshold){
      player3.seekTo(p1Time, true)
    }  

  }
}

setInterval(checkSynchronization, 1000)

