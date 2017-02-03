class StageDirection{
  constructor(){
  	this.stageDirectionMap = []
  	this.entrancesExitsMap = []
    this.stageDirectionIndex = 0
    this.firstStageDirectionIndex = -1
    this.previousStageIdx = -1
  }


  loadStage(previousStageOuptut){
  	var context = this;

  	this.stageDirectionMap = previousStageOuptut["stageDirection"]
  	this.entrancesExitsMap = previousStageOuptut["entrancesExits"]

    this.setStageDirectionDisplay()
    $("#stageDirections").show()

    $(document).keydown(function(e){
      if(e.keyCode == 39){
        //advance - forward arrow
        context.stageDirectionNext()
      }else if(e.keyCode == 37){
        // go back - back arrow
        context.stageDirectionBack()
      }else if(e.keyCode == 67){
        // clear current set - 'C' key
        context.clearDeletedDirections()
      }
    })

    // double click word
    $("#highlightStageDirections").css({cursor:'pointer'})
    $("#highlightStageDirections").click(function(evt){
    	context.idStageDirections(evt)
    });
  }

  teardownStage(){
    $(document).off("keydown")
    $("#stageDirections").hide()
    $("#highlightStageDirections").off("click")
  }


  idStageDirections(evt){ 
	  function sortDirections(a, b){
	    if(a["start"] > b["start"]){
	      return 1
	    }else if(a["start"] < b["start"]){
	      return -1
	    }
	    return 0
	  }

	  var targ = $(evt.target)
	  var newStartIndex = targ.index()

	  // Check to ensure a word was clicked on
	  if($($("#stageDirectionContainer").find("*")[newStartIndex]).is("br")){
	    return;
	  }

	  // Figure out the word index by removing count of breaks
	  var breakCount = 0
	  $("#stageDirectionContainer").find("*").each(function(index){
	    if(index > newStartIndex){
	      return false
	    }
	    if($(this).is("br")){
	      breakCount++
	    }
	  })

	  newStartIndex -= breakCount

	  if(this.previousStageIdx == -1){
	    this.previousStageIdx = newStartIndex
	  }else{
	    var firstStageDirectionIndex = this.previousStageIdx
	    var endIdx = newStartIndex
	    if(firstStageDirectionIndex > endIdx){
	      this.previousStageIdx = endIdx
	      return
	    }

	    var allDivs = $("#stageDirectionContainer").find(".dialogueWord")

	    allDivs.each(function(index){
	      if(index >= firstStageDirectionIndex &&
	         index <= endIdx){
	        $(this).addClass("marked")
	        $(this).removeClass("unmarked")
	      }
	    })

	    this.previousStageIdx = -1
	  }
	}

  setStageDirectionDisplay(){
  	if(this.stageDirectionMap.length != 0 &&
       this.stageDirectionMap[0]["character"] != "" &&
       this.stageDirectionIndex < this.stageDirectionMap.length){
	    var entry = this.stageDirectionMap[this.stageDirectionIndex]
	    $("#directionCharacterName").html(entry["character"])
	    $("#highlightStageDirections").html(entry["html"])
	    return
    }else{
    	this.createEntrancesExitsMap()
    	stageComplete(stageEnum.STAGE_DIRECTIONS, this.entrancesExitsMap)
    }
  }

	stageDirectionBack(){
	  this.stageDirectionMap[this.stageDirectionIndex]["html"] = $("#stageDirectionContainer").parent().html()
	  this.stageDirectionIndex -= 1
	  this.stageDirectionIndex = this.stageDirectionIndex >= 0 ? this.stageDirectionIndex : 0
	  this.setStageDirectionDisplay()

	  this.previousStageIdx = -1
	}

	stageDirectionNext(){
	  this.stageDirectionMap[this.stageDirectionIndex]["html"] = $("#stageDirectionContainer").parent().html()
	  this.stageDirectionIndex += 1
	  this.setStageDirectionDisplay()

	  this.previousStageIdx = -1
	}

	clearDeletedDirections(){
	  var allDivs = $("#stageDirectionContainer").find(".dialogueWord")

	  allDivs.each(function(index){
	    $(this).removeClass("marked")
	    $(this).removeClass("unmarked")
	    $(this).addClass("unmarked")
	  })

	  this.previousStageIdx = -1
	}

	createEntrancesExitsMap(){
	  // break out all other divs
	  for(var key in this.stageDirectionMap){
	    var entry = this.stageDirectionMap[key]
	    var character = entry["character"]
	    var rawText = entry["rawText"]

	    var allDivs = $($.parseHTML(entry["html"])).find(".dialogueWord")

	    var previousIsStageDirection = false
	    var stageDirIdx = -1
	    var stageDirIdxMap = []
	    var letterIndex = 0
	    allDivs.each(function(index){
	      var currWord = $(this).text()
	      // ensure the index updates by skipping spaces
	      if(currWord.length == 0 &&
	        index != allDivs.length -1){
	        return true;
	      }
	      letterIndex= rawText.indexOf(currWord, letterIndex)
	      // if it's the last character, extend to the end
	      if(index == allDivs.length -1){
	        letterIndex = rawText.length
	      }


	      if($(this).hasClass("marked")){
	        if(stageDirIdx == -1){
	          stageDirIdx = letterIndex
	        }
	      }

	      if(($(this).hasClass("unmarked")  || 
	        allDivs.length - 1 == index) &&
	        stageDirIdx != -1){
	        stageDirIdxMap.push({"start": stageDirIdx, "end": letterIndex})
	        stageDirIdx = -1
	      }

	    })


	    if(stageDirIdxMap.length == 0){
	      // whole text is dialogue
	      this.entrancesExitsMap.push({
	          "type": "line",
	          "character": character,
	          "text": rawText
	      })
	    }else{
	      var previousEnd = 0
	      for(var key in stageDirIdxMap){
	        entry = stageDirIdxMap[key]
	        // add dialogue
	        if(entry["start"] != previousEnd){
	          this.entrancesExitsMap.push({
	            "type": "line",
	            "character": character,
	            "text": rawText.substring(previousEnd, entry["start"])
	          })
	        }

	        // add stage direction
	        this.entrancesExitsMap.push({
	          "type": "stageDirection",
	          "text": rawText.substring(entry["start"], entry["end"]),
	          "entrances": [],
	          "exits": []
	        })

	        previousEnd = entry["end"]
	      }

	      // add any dialogue after the last stage direction
	      var finalEntryIdx = stageDirIdxMap.length - 1
	      if(stageDirIdxMap[finalEntryIdx]["end"] != rawText.length){
	        this.entrancesExitsMap.push({
	          "type": "line",
	          "character": character,
	          "text": rawText.substring(stageDirIdxMap[finalEntryIdx]["end"], rawText.length)
	        })
	      }
	    }
	  }
	}
}