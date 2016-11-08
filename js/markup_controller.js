var sceneNumber = 0
var actNumber = 0
var characterList = []
var fullText = ""

// For line disection
var delineateMap = []
var delineateIndex = 0

// For stage directions
var stageDirectionMap = []
var stageDirectionIndex = 0
var firstStageDirectionIndex = -1

// for entrances/Exits
var entrancesExitsMap = []
var entrancesExitsIndex = -1
var charsOnStage = []
var charsOffStage = []

// Processing functions
function createDelineateMap(){
	fullText = $("#rawText").val()
	var lowerCaseText = fullText.toLowerCase()
	var lowerCaseCharacters = []
	for(var key in characterList){
		lowerCaseCharacters.push(characterList[key].toLowerCase())
	}
	for(var key in lowerCaseCharacters){
		var entry = lowerCaseCharacters[key]
		var idx = -1
		while((idx = lowerCaseText.indexOf(entry, idx + 1)) != -1){
			var charBefore = lowerCaseText.charAt(idx - 1)
			var charAfter = lowerCaseText.charAt(idx + entry.length)
			// ensure there is some form of white space so that sub words aren't selected
			var beforeValid = (idx == 0) || ((/[^a-zA-Z\d]/g.test(charBefore)))
			var afterValid = (idx == lowerCaseText.length) || (/[^a-zA-Z\d]/g.test(charAfter))
			if(beforeValid && afterValid){
			  delineateMap.push({"character": characterList[key],
		                     "idx": idx,
		                     "isLine": false})
		  }
		}
	}
	function sortMap(a, b){
    if(a["idx"] > b["idx"]){
    	return 1
    }else if(a["idx"] < b["idx"]){
    	return -1
    }
    return 0
	}
	delineateMap.sort(sortMap)
}

function setDelineateDisplay(){
	if(delineateIndex < 0){
		delineateIndex = 0;
		return
	}

	if(delineateIndex < delineateMap.length){
		var entry = delineateMap[delineateIndex]
		var startIdx = entry["idx"]
		var endIdx = startIdx + entry["character"].length

		var surroundSize = 250
		var beforeIdx = startIdx - surroundSize
		beforeIdx = beforeIdx >= 0 ? beforeIdx : 0

		var afterIdx = endIdx + surroundSize
		afterIdx =  afterIdx <= fullText.length ? afterIdx : fullText.length

		var priorString = fullText.substring(beforeIdx, startIdx)
		var postString = fullText.substring(endIdx, afterIdx)
		$("#delineateText").html(priorString) 
		$("#delineateText").append('<div id="highlightChar">' + fullText.substring(startIdx, endIdx) + "</div>")
		$("#delineateText").append(postString)



	}else{
		delineationComplete()
	}
}

function delineationIsDialogue(){
	delineateMap[delineateIndex]["isLine"] = true
	delineateIndex += 1
	setDelineateDisplay()

}

function delineationNotDialogue(){
	delineateMap[delineateIndex]["isLine"] = false
	delineateIndex += 1
	setDelineateDisplay()
}

function previousDelineation(){
	delineateIndex -= 1
	setDelineateDisplay()
}

function createStageDirectionMap(){
	function appendBetweenEntrys(oldEntry, newEntry){
		var startIdx = oldEntry["idx"]
		var endIdx = startIdx + oldEntry["character"].length
		var charName = fullText.substring(startIdx, endIdx)
		stageDirectionMap.push({
		                      "character": charName,
		                      "rawText": fullText.substring(endIdx, newEntry["idx"]),
		                      "markedText": fullText.substring(endIdx, newEntry["idx"])
	                       })
	}

	var previousEntry = null
	var entry = {"isLine": false}
	for(var key in delineateMap){
		entry = delineateMap[key]
		if(entry["isLine"]){
			if(previousEntry != null){
				appendBetweenEntrys(previousEntry, entry)
  		}
  		previousEntry = entry
		}
	}
	// add the final entry with all remaining text
	var fakeEntry = {"idx": fullText.length + 1}
	appendBetweenEntrys(previousEntry, fakeEntry)
}

function setStageDirectionDisplay(){
	if(stageDirectionIndex < stageDirectionMap.length){
	  var entry = stageDirectionMap[stageDirectionIndex]
	  $("#directionCharacterName").html(entry["character"])
	  $("#highlightStageDirections").html(entry["markedText"])
  }else{
  	stageDirectionsComplete()
  }
}


function stageDirectionBack(){
	stageDirectionIndex -= 1
	stageDirectionIndex = stageDirectionIndex >= 0 ? stageDirectionIndex : 0
	setStageDirectionDisplay()

}

function stageDirectionNext(){
	stageDirectionIndex += 1
	setStageDirectionDisplay()
}

function clearDeletedDirections(){
	stageDirectionMap[stageDirectionIndex]["markedText"] = stageDirectionMap[stageDirectionIndex]["rawText"]
	setStageDirectionDisplay()
}

function idStageDirections(e){
 	var selection = window.getSelection()
  var range = window.getSelection() || document.getSelection() || document.selection.createRange();
  var word = $.trim(range.toString());
  if(word != '') {
    var range =selection.getRangeAt(selection.rangeCount - 1)
	  var endIdx = range.startOffset
	  if(firstStageDirectionIndex >= endIdx){
	    firstStageDirectionIndex = endIdx
	    range.collapse();
      e.stopPropagation();
	    return
	  }
	  if(firstStageDirectionIndex == -1){
	  	firstStageDirectionIndex = endIdx
	  	range.collapse();
      e.stopPropagation();
	  	return
	  }

	  var markedText = stageDirectionMap[stageDirectionIndex]["markedText"]
	  endIdx = markedText.indexOf(" ", endIdx)
	  endIdx = endIdx != -1 ? endIdx : markedText.length 
	  markedText = markedText.slice(0, firstStageDirectionIndex) + '<div class="highlightedDirections">' + markedText.slice(firstStageDirectionIndex, endIdx) + '</div>' + markedText.slice(endIdx)
	  stageDirectionMap[stageDirectionIndex]["markedText"] = markedText
	  setStageDirectionDisplay()

	  firstStageDirectionIndex = -1

  }
  range.collapse();
  e.stopPropagation();

}

// -------------
function createEntrancesExitsMap(){
  // add stage direction if there are directions before the first character speaks
  var localDelinetaeIdx = 0
  for(key in delineateMap){
  	var entry = delineateMap[key]
  	if(entry["isLine"]){
  		break
  	}
  	localDelinetaeIdx += 1
  }

  if(localDelinetaeIdx > 0){
  	var direction = fullText.substring(0, delineateMap[localDelinetaeIdx]["idx"])
    entrancesExitsMap.push({
                     "type": "stageDirection",
                     "text": direction,
                     "entrances": [],
                     "exits": []
                     })
  }

  // break out all other divs
	for(var key in stageDirectionMap){
		var entry = stageDirectionMap[key]
		var character = entry["character"]
		var markedText = entry["markedText"]
		var highlightedArray = markedText.split('<div class="highlightedDirections">')
		for(key in highlightedArray){
			var portion = highlightedArray[key]
			var endDivIndex = portion.indexOf('</div>')
			if(endDivIndex == -1){
				if(portion.replace(/^\s+|\s+$/g, '').length != 0){
		      entrancesExitsMap.push({
                               "type": "line",
                               "character": character,
                               "text": portion
	                             })
		    }
			}else{
				var stageDirection = portion.substring(0, endDivIndex)
				var afterDivIdx = endDivIndex + '</div>'.length
				var line = portion.substring(afterDivIdx)
		    
		    entrancesExitsMap.push({
                         "type": "stageDirection",
                         "text": stageDirection,
                         "entrances": [],
                         "exits": []
	                       })

		    if(line.replace(/^\s+|\s+$/g, '').length != 0){
		      entrancesExitsMap.push({
                               "type": "line",
                               "character": character,
                               "text": line
	                             })
		    }
			}
		}
  }
}

function findNextStageDirection(){
	entrancesExitsIndex += 1
	while(entrancesExitsIndex < entrancesExitsMap.length &&
		entrancesExitsMap[entrancesExitsIndex]["type"] != "stageDirection"){
		entrancesExitsIndex += 1
	}
	return entrancesExitsIndex < entrancesExitsMap.length && 
	       entrancesExitsMap[entrancesExitsIndex]["type"] == "stageDirection"
}

function findPreviousStageDirection(){
	entrancesExitsIndex -= 1
	while(entrancesExitsIndex > 0 &&
		entrancesExitsMap[entrancesExitsIndex]["type"] != "stageDirection"){
		entrancesExitsIndex -= 1
	}
	return entrancesExitsMap[entrancesExitsIndex]["type"] == "stageDirection"
}


function setEntrancesExitsDisplay(){
	if(entrancesExitsIndex < entrancesExitsMap.length){
		var entry = entrancesExitsMap[entrancesExitsIndex]
		// apply the changes that occurr in the transition
		for(var key in entry["entrances"]){
			var enters = entry["entrances"][key]

			var idxOn = charsOnStage.indexOf(enters)
			charsOnStage.splice(idxOn, 1)
			charsOffStage.push(enters)
		}
		for(var key in entry["exits"]){
			var exits = entry["exits"][key]

			var idxOff = charsOffStage.indexOf(exits)
			charsOffStage.splice(idxOff, 1)
			charsOnStage.push(exits)
		}
		entry["entrances"] = []
		entry["exits"] = []

		$("#entrancesExitsText").html(entry["text"])
  	setOnStageOffStage()
	}else{
		entrancesExitsMap.push(entrancesExitsMap.push({
                           "type": "stageDirection",
                           "text": "",
                           "entrances": [],
                           "exits": charsOnStage
	                         }))
		markupComplete()
	}
}


function setOnStageOffStage(){
	charsOnStage.sort()
	charsOffStage.sort()
	var offStageHTML = ""
	for(key in charsOffStage){
		var entry = charsOffStage[key]
		offStageHTML += '<option value="' + entry + '">' + entry + "</option>"
	}
	$("#offStage").html(offStageHTML)

	var onStageHTML = ""
	for(key in charsOnStage){
		var entry = charsOnStage[key]
		onStageHTML += '<option value="' + entry + '">' + entry + "</option>"
	}

	$("#onStage").html(onStageHTML)
}

function enterStage(){
	var entering = $("#offStage").val()
	for(key in entering){
		var enters = entering[key]
		entrancesExitsMap[entrancesExitsIndex]["entrances"].push(enters)
		var offIdx = charsOffStage.indexOf(enters)
		charsOffStage.splice(offIdx,1)
		charsOnStage.push(enters)
	}
	setOnStageOffStage()
}

function exitStage(){
	var exiting = $("#onStage").val()
	for(key in exiting){
		var exits = exiting[key]
		entrancesExitsMap[entrancesExitsIndex]["exits"].push(exits)
		var offIdx = charsOnStage.indexOf(exits)
		charsOnStage.splice(offIdx,1)
		charsOffStage.push(exits)
	}
	setOnStageOffStage()
}

function entrancesExitsBack(){
	if(findPreviousStageDirection()){
	  setEntrancesExitsDisplay()
  }else{
  	findNextStageDirection()
  }
}

function entrancesExitsNext(){
	findNextStageDirection()
	setEntrancesExitsDisplay()
}


function createFinalPML(){
	finalString = ""
	finalString += "@a{number:" + actNumber + "}\n"
	finalString += "@s{number:" + sceneNumber + "}\n"

	for(key in entrancesExitsMap){
		entry = entrancesExitsMap[key]
		if(entry["type"] == "line"){
			finalString += "@l{name:" + entry["character"] + "}\n"
			finalString += entry["text"] + "\n"
		}else if(entry["type"] == "stageDirection"){
			if(entry["text"].length > 0){
		    finalString += "@d{}\n" + entry["text"] + "\n"
		  }
			// entrances
			if(entry["entrances"].length > 0){
			  finalString += "@e{names:["
			  for(enterKey in entry["entrances"]){
				  finalString += entry["entrances"][enterKey] + ","
			  }
			  // get rid of extra comma
			  finalString = finalString.substring(0, finalString.length - 1) + "]}\n"
		  }
			// exits
			if(entry["exits"].length > 0){
			  finalString += "@x{names:["
			  for(exitKey in entry["exits"]){
			  	finalString += entry["exits"][exitKey] + ","
			  }
			  // get rid of extra comma
			  finalString = finalString.substring(0, finalString.length -1) + "]}\n"
		  }
		}
	}

	$("#pmlOutput").html(finalString)
}



// Transition functions
function charactersTransition(){
	$("#intro").toggle()
	$("#sceneText").toggle()
	var tmpCharacterList = $("#characterList").val().split(",")
	for(key in tmpCharacterList){
		entry = tmpCharacterList[key]
		characterList.push(entry.replace(/\s/g, ''))
	}
}

function textSubmitted(){
  sceneNumber = parseInt($("#sceneNum").val())
	actNumber = parseInt($("#actNum").val())
	if(actNumber == 0 || sceneNumber == 0){
		$("#asFailMessage").html("It appears you didn't set an act or scene number for this text.")
		return
	}
	$("#sceneText").hide()
	createDelineateMap()
	setDelineateDisplay()
	$("#delineateLines").show()
	$(document).keydown(function(e){
		if(e.keyCode == 39){
			delineationIsDialogue()
		}else if(e.keyCode == 37){
			delineationNotDialogue()
		}else if(e.keyCode == 40 || e.keyCode == 38){
			previousDelineation()
		}
	})
}

function delineationComplete(){
	$("#delineateLines").hide()
	createStageDirectionMap()
	setStageDirectionDisplay()
	$("#stageDirections").show()
	$(document).unbind("keydown")
	$(document).keydown(function(e){
		if(e.keyCode == 39){
			//advance
			stageDirectionNext()
		}else if(e.keyCode == 37){
			// go back
			stageDirectionBack()
		}else if(e.keyCode == 67){
			// clear current set
			clearDeletedDirections()
		}
	})

  // double click word
  $("#highlightStageDirections").css({cursor:'pointer'})
  $("#highlightStageDirections").dblclick(idStageDirections);
}

function stageDirectionsComplete(){
	$("#stageDirections").hide()
	$(document).unbind("keydown")
	$(document).keydown(function(e){
		if(e.keyCode == 39){
			//advance
			entrancesExitsNext()
		}else if(e.keyCode == 37){
			// go back
			entrancesExitsBack()
		}
	})

	createEntrancesExitsMap()
	if(entrancesExitsMap.length > 0){
	  charsOffStage = characterList
	  findNextStageDirection()
	  setEntrancesExitsDisplay()
	  $("#entrancesExits").show()
  }else{
  	markupComplete()
  }
}


function markupComplete(){
	$("#entrancesExits").hide()
	createFinalPML()
	$("#markupComplete").show()
}


function nextScene(){
  fullText = ""

  // For line disection
  delineateMap = []
  delineateIndex = 0

  // For stage directions
  stageDirectionMap = []
  stageDirectionIndex = 0
  firstStageDirectionIndex = -1

  // for entrances/Exits
  entrancesExitsMap = []
  entrancesExitsIndex = -1
  charsOnStage = []
  charsOffStage = []

	$("#asFailMessage").html("")
	$("#rawText").val("")
	$("#pmlOutput").html("")
	$("#sceneNum").val(parseInt($("#sceneNum").val()) + 1)
	$("#markupComplete").hide()

	$("#sceneText").show()
}

$(document).ready(function(){

	$("#submitCharacters").click(charactersTransition)
	$("#charactersBack").click(charactersTransition)
	$("#submitRawText").click(textSubmitted)

	// entrances/exits
	$("#enterStage").click(enterStage)
	$("#exitStage").click(exitStage)

	$("#nextScene").click(nextScene)

})