class PMLOutput{
  constructor(){

  }


  loadStage(previousStageOuptut){
  	this.entrancesExitsMap = previousStageOuptut
  	this.sceneNumber = parseInt($("#sceneNum").val())
    this.actNumber = parseInt($("#actNum").val())
    this.createFinalPML()

  	$("#markupComplete").show()

  }

  teardownStage(){
  	$("#markupComplete").hide()
  }

	createFinalPML(){
	  var finalString = ""
	  finalString += '@a{"number":' + this.actNumber + '}\n'
	  finalString += '@s{"number":' + this.sceneNumber + '}\n'

	  for(var key in this.entrancesExitsMap){
	    var entry = this.entrancesExitsMap[key]
	    if(entry["type"] == "line" && 
	      entry["character"] != "" &&
	      entry["text"].trim() != ""){
	      finalString += '@l{"name":"' + entry["character"] + '"}\n'
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
	        finalString += '@e{"names":['
	        for(var enterKey in entry["entrances"]){
	          finalString += '"' + entry["entrances"][enterKey] + '",'
	        }
	        // get rid of extra comma
	        finalString = finalString.substring(0, finalString.length - 1) + "]}\n\n"
	      }
	      // exits
	      if(entry["exits"].length > 0){
	        finalString += '@x{"names":['
	        for(var exitKey in entry["exits"]){
	          finalString += '"' + entry["exits"][exitKey] + '",'
	        }
	        // get rid of extra comma
	        finalString = finalString.substring(0, finalString.length -1) + "]}\n\n"
	      }
	    }
	  }

	  $("#pmlOutput").val(finalString)
	}

}