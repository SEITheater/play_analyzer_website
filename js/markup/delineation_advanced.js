class LineDelineation{
  constructor(){
  	this.delineateMap = []
  	this.delineateIndex = 0
  	this.stageDirectionMap = []
  	this.entrancesExitsMap = []
  }


  loadStage(previousStageOuptut){
  	var context = this;
  	this.delineateMap = previousStageOuptut
    $("#delineateLines").show()

    $(document).keydown(function(e){
      if(e.keyCode == 39){
        context.delineationIsDialogue()
      }else if(e.keyCode == 37){
        context.delineationNotDialogue()
      }else if(e.keyCode == 40 || e.keyCode == 38){
        context.previousDelineation()
      }
    })

    this.setDelineateDisplay()
  }

  teardownStage(){
  	$("#delineateLines").hide()
  	$(document).off("keydown")
  }

	setDelineateDisplay(){
	  if(this.delineateIndex < 0){
	    this.delineateIndex = 0;
	    return
	  }

	  if(this.delineateIndex < this.delineateMap.length){
	    var entry = this.delineateMap[this.delineateIndex]
	    var startIdx = entry["idx"]
	    var endIdx = startIdx + entry["character"].length

	    var surroundSize = 250
	    var beforeIdx = startIdx - surroundSize
	    beforeIdx = beforeIdx >= 0 ? beforeIdx : 0

	    var afterIdx = endIdx + surroundSize
	    // Bad form - should make fullText accessible in different way
	    afterIdx =  afterIdx <= markupInput.fullText.length ? afterIdx : markupInput.fullText.length

	    var priorString = markupInput.fullText.substring(beforeIdx, startIdx)
	    var postString = markupInput.fullText.substring(endIdx, afterIdx)
	    $("#delineateText").html(priorString) 
	    $("#delineateText").append('<div id="highlightChar">' + markupInput.fullText.substring(startIdx, endIdx) + "</div>")
	    $("#delineateText").append(postString)

	  }else{
	  	this.createStageDirectionMap()
	    stageComplete(stageEnum.LINE_DELINEATION, {"stageDirection":this.stageDirectionMap, "entrancesExits": this.entrancesExitsMap})
	  }
	}

	delineationIsDialogue(){
	  this.delineateMap[this.delineateIndex]["isLine"] = true
	  this.delineateIndex += 1
	  this.setDelineateDisplay()

	}

	delineationNotDialogue(){
	  this.delineateMap[this.delineateIndex]["isLine"] = false
	  this.delineateIndex += 1
	  this.setDelineateDisplay()
	}

	previousDelineation(){
	  this.delineateIndex -= 1
	  this.setDelineateDisplay()
	}

	createStageDirectionMap(){
		var context = this;
	  function appendBetweenEntrys(oldEntry, newEntry){
	    var startIdx = oldEntry["idx"]
	    var endIdx = startIdx + oldEntry["character"].length
	    var charName = markupInput.fullText.substring(startIdx, endIdx)

	    // setting up html
	    //var rawArray = fullText.substring(endIdx, newEntry["idx"]).split(/\s+/)
	    var rawArray = markupInput.fullText.substring(endIdx, newEntry["idx"]).split(" ")
	    var htmlString = '<div id="stageDirectionContainer">'
	    for(var key in rawArray){
	      var word = rawArray[key]
	      htmlString += '<div class="dialogueWord unmarked">' + word + '</div>'
	    }
	    htmlString += "</div>"

	    htmlString = htmlString.replace(/(?:\r\n|\r|\n)/g, '</div><br /><div class="dialogueWord unmarked">')

	    context.stageDirectionMap.push({
	                          "character": charName,
	                          "rawText": markupInput.fullText.substring(endIdx, newEntry["idx"]),
	                          "html": htmlString
	                         })
	  }

	  var previousEntry = null
	  var entry = {"isLine": false}
	  for(var key in this.delineateMap){
	    entry = this.delineateMap[key]
	    if(entry["isLine"]){
	      if(previousEntry != null){
	        appendBetweenEntrys(previousEntry, entry)
	      }else if(entry["idx"] != 0){
	        this.entrancesExitsMap.push({
	          "type": "stageDirection",
	          "text": markupInput.fullText.substring(0, entry["idx"]),
	          "entrances": [],
	          "exits": []
	        })        
	      }
	      previousEntry = entry
	    }
	  }
	  // add the final entry with all remaining text
	  if(previousEntry == null){
	    previousEntry = {"idx": 0, "character": ""}
	  }
	  var fakeEntry = {"idx": markupInput.fullText.length + 1}
	  appendBetweenEntrys(previousEntry, fakeEntry)
	}

}