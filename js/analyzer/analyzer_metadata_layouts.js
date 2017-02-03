function parseMetadataResponse(responseFromServer, requestType){
  var htmlString = ""

  if(requestType == "character_list"){
  	htmlString = layoutCharacterList(responseFromServer)
  }else if(requestType == "character_speech_flow"){
  	htmlString = layoutCharacterSpeechFlow(responseFromServer)
  }else if(requestType == "most_common_words"){
  	htmlString = layoutMostCommonWords(responseFromServer)
  }else if(requestType == "common_contexts"){
  	htmlString = layoutCommonContexts(responseFromServer)
  }else if(requestType == "concordance"){
  	htmlString = layoutConcordance(responseFromServer)
  }else{
    try{
      htmlString = parseMetadata(JSON.parse(responseFromServer))
    }catch(e){
      htmlString = responseFromServer.replace("\n", "<br>")
    }
  }

  return htmlString
}

function layoutCharacterList(responseFromServer){
	return parseMetadata(JSON.parse(responseFromServer))

}

function layoutCharacterSpeechFlow(responseFromServer){
	var html = ""
	var speechMap = JSON.parse(responseFromServer)
	for(var key in speechMap){
		var entry = speechMap[key]
		var char1 = entry["character_1"]
		var char2 = entry["character_2"]
		var percentage = entry["percentage"]
		var count = entry["count"]

		html += char1 + " speaks before " + char2 + " " + parseInt(count) + 
		          " times which is " + parseFloat(percentage).toFixed(4) + "% of lines" + "<br>"
	}

	return html
}

function layoutMostCommonWords(responseFromServer){
  var html = ""
	var wordMap = JSON.parse(responseFromServer)
	for(var key in wordMap){
		var entry = wordMap[key]
		html += entry["word"] + " - " + parseInt(entry["count"]) + " times" +"<br>"
	}
	return html
}

function layoutCommonContexts(responseFromServer){
  var html = ""
	var contextMap = JSON.parse(responseFromServer)
	for(var key in contextMap){
		var entry = contextMap[key]
		var word = entry["word"]
		var context = entry["context"]
		html += "Words input: " + word + "<br>" + "Other words used in the same context: " + context + "<br>"
	}
	return html
}

function layoutConcordance(responseFromServer){
	var firstLineIDX = responseFromServer.indexOf("\n")
	return responseFromServer.substring(firstLineIDX)
}

function parseMetadata(responseObject){
	reqObj = getCurrentRequestObject()
	retFormat = reqObj["return_format"]
	var htmlString = ""
	for(entry in responseObject){
		var subObject = responseObject[entry]
		var asString = JSON.stringify(subObject)
		if(asString.indexOf("[") == -1 && asString.indexOf("{") == -1){
		  htmlString += responseObject[entry] + "<br>"
		}else{
		  htmlString += parseMetadata(subObject) + "<br>"
   	}
	}
	return htmlString
}
