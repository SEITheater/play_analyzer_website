var activeFile = ""
var validFileRecievedCount = 0

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

function resultOfUserRequest(responseFromServer){
	toggleAnalyzingDisplay()
	var reqObject = getCurrentRequestObject()
	if(reqObject["request_path"] == "generate_viz"){
		imgString = '<img src="data:image/png;base64, ' + responseFromServer + '"/>'
		$("#vizOutput").html(imgString)
		$("#vizOutput").css('text-align', 'center')
	}else{
		var htmlString = parseMetadataResponse(responseFromServer, reqObject["request_type"])
		$("#vizOutput").html(htmlString)
		$("#vizOutput").css('text-align', 'left')
  }
}


function serverError(){
	alert("There appears to be an error in your request")
	toggleAnalyzingDisplay()
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
		var reqObject = getCurrentRequestObject()
		var params = collectCurrentParameters()
		if(verifyAnalyzerRequest(reqObject, params)){
		  toggleAnalyzingDisplay()
		  makePostRequest(activeFile, reqObject["request_path"], reqObject["request_type"], params, resultOfUserRequest, serverError)
	  }
	})
});

