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

    // setting up html
    //var rawArray = fullText.substring(endIdx, newEntry["idx"]).split(/\s+/)
    var rawArray = fullText.substring(endIdx, newEntry["idx"]).split(" ")
    var htmlString = '<div id="stageDirectionContainer">'
    for(var key in rawArray){
      var word = rawArray[key]
      htmlString += '<div class="dialogueWord unmarked">' + word + '</div>'
    }
    htmlString += "</div>"

    htmlString = htmlString.replace(/(?:\r\n|\r|\n)/g, '</div><br /><div class="dialogueWord unmarked">')

    stageDirectionMap.push({
                          "character": charName,
                          "rawText": fullText.substring(endIdx, newEntry["idx"]),
                          "html": htmlString
                         })
  }

  var previousEntry = null
  var entry = {"isLine": false}
  for(var key in delineateMap){
    entry = delineateMap[key]
    if(entry["isLine"]){
      if(previousEntry != null){
        appendBetweenEntrys(previousEntry, entry)
      }else if(entry["idx"] != 0){
        entrancesExitsMap.push({
          "type": "stageDirection",
          "text": fullText.substring(0, entry["idx"]),
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
  var fakeEntry = {"idx": fullText.length + 1}
  appendBetweenEntrys(previousEntry, fakeEntry)
}

var previousStageIdx = -1

function stageDirectionBack(){
  stageDirectionMap[stageDirectionIndex]["html"] = $("#stageDirectionContainer").parent().html()
  stageDirectionIndex -= 1
  stageDirectionIndex = stageDirectionIndex >= 0 ? stageDirectionIndex : 0
  setStageDirectionDisplay()

  previousStageIdx = -1
}

function stageDirectionNext(){
  stageDirectionMap[stageDirectionIndex]["html"] = $("#stageDirectionContainer").parent().html()
  stageDirectionIndex += 1
  setStageDirectionDisplay()

  previousStageIdx = -1
}

function clearDeletedDirections(){
  var allDivs = $("#stageDirectionContainer").find(".dialogueWord")

  allDivs.each(function(index){
    $(this).removeClass("marked")
    $(this).removeClass("unmarked")
    $(this).addClass("unmarked")
  })

  previousStageIdx = -1
}


function idStageDirections(evt){ 
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

  if(previousStageIdx == -1){
    previousStageIdx = newStartIndex
  }else{
    var firstStageDirectionIndex = previousStageIdx
    var endIdx = newStartIndex
    if(firstStageDirectionIndex > endIdx){
      previousStageIdx = endIdx
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

    previousStageIdx = -1
  }
}


function setStageDirectionDisplay(){
  if(stageDirectionIndex < stageDirectionMap.length){
    var entry = stageDirectionMap[stageDirectionIndex]
    $("#directionCharacterName").html(entry["character"])

    $("#highlightStageDirections").html(entry["html"])
  }else{
    stageDirectionsComplete()
  }
}

// -------------
function createEntrancesExitsMap(){
  // break out all other divs
  for(var key in stageDirectionMap){
    var entry = stageDirectionMap[key]
    var character = entry["character"]
    var rawText = entry["rawText"]

    var allDivs = $($.parseHTML(entry["html"])).find(".dialogueWord")

    // these are purposefully global for access inside the .each
    previousIsStageDirection = false
    stageDirIdx = -1
    stageDirIdxMap = []
    letterIndex = 0
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
      entrancesExitsMap.push({
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
          entrancesExitsMap.push({
            "type": "line",
            "character": character,
            "text": rawText.substring(previousEnd, entry["start"])
          })
        }

        // add stage direction
        entrancesExitsMap.push({
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
        entrancesExitsMap.push({
          "type": "line",
          "character": character,
          "text": rawText.substring(stageDirIdxMap[finalEntryIdx]["end"], rawText.length)
        })
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
  entrancesExitsIndex = entrancesExitsIndex >= 0 ? entrancesExitsIndex: 0
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

    if(entrancesExitsIndex > 0){
      var preTextString = ""
      var previousEntry = entrancesExitsMap[entrancesExitsIndex - 1]
      if(previousEntry["type"] == "line"){
        preTextString += previousEntry["character"] + "\n"
      }
      preTextString += previousEntry["text"]
      $("#preEntranceExitText").html(preTextString)
    }else{
      $("#preEntranceExitText").html("")
    }
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

    // Remove it from the exit map in case of toggling back and forth
    var exitsIdx = entrancesExitsMap[entrancesExitsIndex]["exits"].indexOf(enters)
    if(exitsIdx != -1){
      entrancesExitsMap[entrancesExitsIndex]["exits"].splice(exitsIdx, 1)
    }else{
      // Update the entrances map
      entrancesExitsMap[entrancesExitsIndex]["entrances"].push(enters)
    }

    // Remove it from tracking for display
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

    // Remove it from the exit map in case of toggling back and forth
    var entersIdx = entrancesExitsMap[entrancesExitsIndex]["entrances"].indexOf(exits)
    if(entersIdx != -1){
      entrancesExitsMap[entrancesExitsIndex]["entrances"].splice(entersIdx, 1)
    }else{
      // Update the exits map
      entrancesExitsMap[entrancesExitsIndex]["exits"].push(exits)
    }

    // Remove it from tracking for display
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
    if(entry["type"] == "line" && entry["character"] != ""){
      finalString += "@l{name:" + entry["character"] + "}\n"
      finalString += entry["text"] + "\n"
    }else if(entry["type"] == "line" && entry["character"] == ""){
      // No delineation, so all stage direction
      finalString += "@d{}\n" + entry["text"] + "\n"
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
    characterList.push(entry.trim())
  }
}

function textSubmitted(){
  sceneNumber = parseInt($("#sceneNum").val())
  actNumber = parseInt($("#actNum").val())
  if(actNumber <= -1 || sceneNumber <= -1){
    $("#asFailMessage").html("It appears you didn't set an act or scene number for this text.")
    return
  }
  $("#sceneText").hide()
  createDelineateMap()
  if(delineateMap.length > 0){
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
  }else{
    delineationComplete()
  }
}

function delineationComplete(){
  $("#delineateLines").hide()
  createStageDirectionMap()
  if(stageDirectionMap.length != 0
    && stageDirectionMap[0]["character"] != ""){
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
    $("#highlightStageDirections").click(idStageDirections);
  }else{
    stageDirectionsComplete()
  }
}

function stageDirectionsComplete(){
  $("#stageDirections").hide()
  $(document).unbind("keydown")
  $("#highlightStageDirections").unbind("click")
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



  if(entrancesExitsMap.length == 1){
    if(entrancesExitsMap[0]["type"] == "line"
      && entrancesExitsMap[0]["character"] == ""){
      markupComplete()
      return
    }
  }
  if(entrancesExitsMap.length > 0){
    charsOffStage = characterList.slice(0)
    findNextStageDirection()
    setEntrancesExitsDisplay()
    $("#entrancesExits").show()
  }else{
    markupComplete()
  }
}


function markupComplete(){
  $("#entrancesExits").hide()
  $(document).unbind("keydown")
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

function makeHeader(){
  $("#intro").hide()
  $("#markupComplete").hide()
  $("#makeHeader").show()
  $("#titleInput").on('paste, keyup', updateHeaderOutput)
  $("#authorInput").on('paste, keyup', updateHeaderOutput)
  $(document).click(updateHeaderOutput)
}

function updateHeaderOutput(){
  var titleVal = $("#titleInput").val()
  var authorVal = $("#authorInput").val()
  pmlString = '@v{"version": 0.1}\n @play{"title":"'
                + titleVal + '"}, "author": "' + authorVal + '"}\n'

  $("#headerOutput").html(pmlString)
}

var characterListClickCount = 0
var rawTextClickCount = 0

$(document).ready(function(){
  $("#characterList").click(function(){
    if(characterListClickCount == 0){
      $("#characterList").val("")
      characterListClickCount += 1
    }
  })
  
  $("#rawText").click(function(){
    if(rawTextClickCount == 0){
      $("#rawText").val("")
      rawTextClickCount += 1
    }
  })

  $("#submitCharacters").click(charactersTransition)
  $("#charactersBack").click(charactersTransition)
  $("#submitRawText").click(textSubmitted)

  // entrances/exits
  $("#enterStage").click(enterStage)
  $("#exitStage").click(exitStage)

  $("#nextScene").click(nextScene)

  $(".makeHeaderClick").click(makeHeader)

})