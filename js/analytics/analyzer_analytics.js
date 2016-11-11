function analyticsPMLFileUpload(success){
	var uploadString = 'pml_upload_valid'
	if(!success){ uploadString = 'pml_upload_invalid' }
  ga('send', 'event', uploadString, 'file_upload', 'analyzer_pml_upload')
}

function analysisRequested(analysisType){
	ga('send', 'event', 'analyzer', 'analysis_requested', '', {'dimension1': analysisType})
}