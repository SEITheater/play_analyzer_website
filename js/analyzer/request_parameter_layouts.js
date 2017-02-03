var availableRequestList = []
var currentParameterNames = []

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


