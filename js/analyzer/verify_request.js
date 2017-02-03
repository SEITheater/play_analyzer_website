function verifyAnalyzerRequest(reqObject, params){
	if(reqObject["display_name"] == "Validate PML"){
		return false
	}

	return true;
}
