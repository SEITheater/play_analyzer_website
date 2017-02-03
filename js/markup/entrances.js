class EntrancesExits{
  constructor(){
  	this.entrancesExitsMap = []
  	this.entrancesExitsIndex = -1
    this.charsOnStage = []
    this.charsOffStage = []
  }


  loadStage(previousStageOuptut){
  	var context = this;
  	context.entrancesExitsMap = previousStageOuptut
  	// Bad style - sholud have alt way to access characterList
  	this.charsOffStage = markupInput.characterList.slice(0)

    if(this.entrancesExitsMap.length == 0){
	    stageComplete(stageEnum.ENTRANCES, this.entrancesExitsMap)
    	return
    }

  	$("#enterStage").click(function(){
  		context.enterStage()
  	})
    $("#exitStage").click(function(){
    	context.exitStage()
    })
    $("#nextScene").click(function(){
    	context.nextScene()
    })

    $(document).keydown(function(e){
	    if(e.keyCode == 39){
	      //advance
	      context.entrancesExitsNext()
	    }else if(e.keyCode == 37){
	      // go back
	      context.entrancesExitsBack()
	    }
    })

    this.findNextStageDirection();
    this.setEntrancesExitsDisplay()
   	$("#entrancesExits").show()
  }

  teardownStage(){
  	$("#enterStage").off("click")
    $("#exitStage").off("click")
    $("#nextScene").off("click")
    $(document).off("keydown")
   	$("#entrancesExits").hide()
  }


	findNextStageDirection(){
	  this.entrancesExitsIndex += 1
	  while(this.entrancesExitsIndex < this.entrancesExitsMap.length &&
	    this.entrancesExitsMap[this.entrancesExitsIndex]["type"] != "stageDirection"){
	    this.entrancesExitsIndex += 1
	  }
	  return this.entrancesExitsIndex < this.entrancesExitsMap.length && 
	           this.entrancesExitsMap[this.entrancesExitsIndex]["type"] == "stageDirection"
	}

	findPreviousStageDirection(){
	  this.entrancesExitsIndex -= 1
	  while(this.entrancesExitsIndex > 0 &&
	    this.entrancesExitsMap[this.entrancesExitsIndex]["type"] != "stageDirection"){
	    this.entrancesExitsIndex -= 1
	  }
	  this.entrancesExitsIndex = this.entrancesExitsIndex >= 0 ? this.entrancesExitsIndex: 0
	  return this.entrancesExitsMap[this.entrancesExitsIndex]["type"] == "stageDirection"
	}


	setEntrancesExitsDisplay(){
	  if(this.entrancesExitsIndex < this.entrancesExitsMap.length || 
	  	(this.entrancesExitsMap.length == 1 && 
	  	 entrancesExitsMap[0]["type"] == "line" &&
       entrancesExitsMap[0]["character"] == "")){
	    var entry = this.entrancesExitsMap[this.entrancesExitsIndex]
	    // apply the changes that occurr in the transition
	    for(var key in entry["entrances"]){
	      var enters = entry["entrances"][key]

	      var idxOn = this.charsOnStage.indexOf(enters)
	      this.charsOnStage.splice(idxOn, 1)
	      this.charsOffStage.push(enters)
	    }
	    for(var key in entry["exits"]){
	      var exits = entry["exits"][key]

	      var idxOff = this.charsOffStage.indexOf(exits)
	      this.charsOffStage.splice(idxOff, 1)
	      this.charsOnStage.push(exits)
	    }
	    entry["entrances"] = []
	    entry["exits"] = []

	    if(this.entrancesExitsIndex > 0){
	      var preTextString = ""
	      var previousEntry = this.entrancesExitsMap[this.entrancesExitsIndex - 1]
	      if(previousEntry["type"] == "line"){
	        preTextString += previousEntry["character"] + "\n"
	      }
	      preTextString += previousEntry["text"]
	      $("#preEntranceExitText").html(preTextString)
	    }else{
	      $("#preEntranceExitText").html("")
	    }
	    $("#entrancesExitsText").html(entry["text"])
	    this.setOnStageOffStage()
	  }else{
	    this.entrancesExitsMap.push(this.entrancesExitsMap.push({
	                           "type": "stageDirection",
	                           "text": "",
	                           "entrances": [],
	                           "exits": this.charsOnStage
	                           }))
	    stageComplete(stageEnum.ENTRANCES, this.entrancesExitsMap)
	  }
	}

	setOnStageOffStage(){
	  this.charsOnStage.sort()
	  this.charsOffStage.sort()
	  var offStageHTML = ""
	  for(var key in this.charsOffStage){
	    var entry = this.charsOffStage[key]
	    offStageHTML += '<option value="' + entry + '">' + entry + "</option>"
	  }
	  $("#offStage").html(offStageHTML)

	  var onStageHTML = ""
	  for(var key in this.charsOnStage){
	    var entry = this.charsOnStage[key]
	    onStageHTML += '<option value="' + entry + '">' + entry + "</option>"
	  }

	  $("#onStage").html(onStageHTML)
	}

	enterStage(){
	  var entering = $("#offStage").val()
	  for(var key in entering){
	    var enters = entering[key]

	    // Remove it from the exit map in case of toggling back and forth
	    var exitsIdx = this.entrancesExitsMap[this.entrancesExitsIndex]["exits"].indexOf(enters)
	    if(exitsIdx != -1){
	      this.entrancesExitsMap[this.entrancesExitsIndex]["exits"].splice(exitsIdx, 1)
	    }else{
	      // Update the entrances map
	      this.entrancesExitsMap[this.entrancesExitsIndex]["entrances"].push(enters)
	    }

	    // Remove it from tracking for display
	    var offIdx = this.charsOffStage.indexOf(enters)
	    this.charsOffStage.splice(offIdx,1)
	    this.charsOnStage.push(enters)
	  }
	  this.setOnStageOffStage()
	}

	exitStage(){
	  var exiting = $("#onStage").val()
	  for(var key in exiting){
	    var exits = exiting[key]

	    // Remove it from the exit map in case of toggling back and forth
	    var entersIdx = this.entrancesExitsMap[this.entrancesExitsIndex]["entrances"].indexOf(exits)
	    if(entersIdx != -1){
	      this.entrancesExitsMap[this.entrancesExitsIndex]["entrances"].splice(entersIdx, 1)
	    }else{
	      // Update the exits map
	      this.entrancesExitsMap[this.entrancesExitsIndex]["exits"].push(exits)
	    }

	    // Remove it from tracking for display
	    var offIdx = this.charsOnStage.indexOf(exits)
	    this.charsOnStage.splice(offIdx,1)
	    this.charsOffStage.push(exits)
	  }
	  this.setOnStageOffStage()
	}

	entrancesExitsBack(){
	  if(this.findPreviousStageDirection()){
	    this.setEntrancesExitsDisplay()
	  }else{
	    this.findNextStageDirection()
	  }
	}

	entrancesExitsNext(){
	  this.findNextStageDirection()
	  this.setEntrancesExitsDisplay()
	}

}
