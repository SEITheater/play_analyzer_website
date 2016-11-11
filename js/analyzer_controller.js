var activeFile = ""
var validFileRecievedCount = 0
var availableRequestList = []
var currentParameterNames = []

function receivedValidatedFile(){
	// Only run on the first file uploaded
	if(validFileRecievedCount > 0){
		return
	}
	validFileRecievedCount += 1
	activeFile = globalFileList[globalFileList.length - 1]

	$("#introText").remove()
	$("#controlPanel").show();


}

function filterRequests(displayName){
	if(displayName == "Validate PML" || displayName == "Parsed Play List"){
		return false;
	}
	return true;
}

function getCurrentRequestObject(){
	var requestType = $("#requestTypeSelected").val()
	for(key in availableRequestList){
		entry = availableRequestList[key]
		if(entry["request_type"] == requestType){
			return entry
		}
	}
}


function recievedAvailableRequestTypes(responseFromServer){
	availableRequestList = JSON.parse(responseFromServer)
	optionPt1 = '<option value="'
	optionPt2 = '">'
	optionPt3 = "</option>"
	fullSelectString = '<select id="requestTypeSelected">'
	// make a default display
	fullSelectString += optionPt1 + optionPt2 + "Select an analysis" + optionPt3

	for (key in availableRequestList){
		entry = availableRequestList[key]
		displayName = entry["display_name"]
		if(filterRequests(displayName)){
		  // append clarifying info
		  if(entry["request_path"] == "metadata"){
			  displayName = "Metadata - " + displayName
		  }else if(entry["request_path"] == "generate_viz"){
		    displayName = "Visualization - " + displayName
		  }

		  optionString = optionPt1 + entry["request_type"] + 
		                 optionPt2 + displayName + optionPt3
		  fullSelectString += optionString
	  }
	}


  fullSelectString += "</select>"
	$("#requestSelection").html(fullSelectString)

	// set up the callback for a new request type being selected
	$("#requestSelection").change(function(){
		$("#parametersDescription").show()
		setParametersForSelectedType()
	})

}


function constructParameterHTML(name, expectedType){
	html = name + ' <input id="' + name + '" '
	switch(expectedType){
		case "int":
		  html += 'type="number" step="1" min="0"'
		  break
		case "float":
		  html += ' type="number" step="0.01" min="0"'
		  break
		case "bool":
		  break
		case "string":
		case "int_array":
		case "string_array":
		  html += ' type="text"'
		  break
	}
	html += '/><br>'
	return html
}

function setParametersForSelectedType(){
	currentParameterNames = []
	fullParamHTML = ""
	var reqObject = getCurrentRequestObject()
	var parameters = reqObject["params"]
	for(key in parameters){
		var entry = parameters[key]
		var paramName = entry["name"]
		if(paramName != "pml_text" && paramName != "type"){
			currentParameterNames.push(paramName)
			fullParamHTML += constructParameterHTML(paramName, entry["expected_value_type"])
		}
	}

	$("#parameters").html(fullParamHTML)
}


function collectCurrentParameters(){
	allParams = {}
	for(key in currentParameterNames){
		name = currentParameterNames[key]
		currentVal = $("#" + name).val()
		allParams[name] = currentVal
	}
	return allParams
}


function blobToBase64(input) { // fn BLOB => Binary => Base64 ?
    var uInt8Array = new Uint8Array(input)
    var i = uInt8Array.length
    var biStr = []; //new Array(i);
    while (i--) { biStr[i] = String.fromCharCode(uInt8Array[i]);  }
    var base64 = window.btoa(biStr.join(''));
    return base64;
};

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

function resultOfUserRequest(responseFromServer){
	toggleAnalyzingDisplay()
	var reqObject = getCurrentRequestObject()
	if(reqObject["request_path"] == "generate_viz"){
		imgString = '<img src="data:image/png;base64, ' + responseFromServer + '"/>'
		$("#vizOutput").html(imgString)
	}else{
		var htmlString = ""
		try{
			htmlString = parseMetadata(JSON.parse(responseFromServer))
		}catch(e){
			htmlString = responseFromServer.replace("\n", "<br>")
		}

  	$("#vizOutput").html(htmlString)
  }
}

function toggleAnalyzingDisplay(){
	$("#vizOutput").toggle()
	$("#controlPanel").toggle()
	$("#analyzingProgress").toggle()
}

// Get the list of available request types and load it into the control panel
// so that the site is ready to go as soon as the file is uploaded
$(document).ready(function(){
	getAvailableRequestTypes(recievedAvailableRequestTypes)
	$("#submitRequest").click(function(){
		toggleAnalyzingDisplay()
		var reqObject = getCurrentRequestObject()
		var params = collectCurrentParameters()
		makePostRequest(activeFile, reqObject["request_path"], reqObject["request_type"], params, resultOfUserRequest)
		// let analytics know about the rquest
		analysisRequested(reqObject["request_type"])
	})
});

