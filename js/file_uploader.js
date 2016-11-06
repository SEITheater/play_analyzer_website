// Copyright Kevin M. Karol, 2016
// Provided under the MIT License to assist with image and metadata requests to PlayAnalyzer.com
// Please use these scripts in compliance with the site's Terms of Service
// and ensure that you have appropriate permissions before digitizing copyrighted texts

var globalFileList = []

//Set up Dropzone
$(document).ready(function(){
	// Get the template HTML and remove it from the doumenthe template HTML and remove it from the doument
	var previewNode = document.querySelector("#template");
	previewNode.id = "";
	var previewTemplate = previewNode.innerHTML;
	// set up the dropzone
	var myDropzone = new Dropzone(document.body, { // Make the whole body a dropzone
	  url: "http://fake",
	  previewTemplate: previewTemplate,
	  clickable: dropZone,
	  autoQueue: false
	});

	// Respond to a new file being dragged onto the web page
	// Default implementation adds the file to the global namespace through the file list
	// and sends a post request to validate that it's properly marked up PML
  myDropzone.on("addedfile", function(progress) {
  	// pass the newly added file along to the global file list
  	globalFileList = myDropzone.files

  	// send a request to validate the file as properly marked up PML
  	var numFiles = myDropzone.files.length
  	var file = myDropzone.files[numFiles - 1]
  	makePostRequest(file, "validate_pml", "", {}, isValidPML)

  });
})



function isValidPML(responseFromServer){
	var map = JSON.parse(responseFromServer)
	if(map["isValidPML"]){
		receivedValidatedFile()
	}else{		
		$("#uploadInstructions").replaceWith("There appears to be a problem with that file.  Please ensure the file is properly marked up with PML and try re-submitting.")
	}
}