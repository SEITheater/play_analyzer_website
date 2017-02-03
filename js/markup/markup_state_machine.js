// Stages with the same enum should have the same data output for stageComplete
stageEnum = {
  PAGE_LOADED: 1, 
  INPUTS: 2, 
  LINE_DELINEATION: 3, 
  STAGE_DIRECTIONS: 4, 
  ENTRANCES: 5, 
  PML_OUTPUT: 6
}

// stage classes
var markupInput = new MarkupInput()
var lineDelineation = new LineDelineation()
var stageDirection = new StageDirection()
var entrancesExits = new EntrancesExits()
var pmlOutput = new PMLOutput()
var header = new Header()

// Currently there is a single path through this function, but it should
// allow for branching methods of e.g. line delineation with a simple switch
// here about which it loads in
function stageComplete(stageName, stageOutput){
  if(stageName == stageEnum.PAGE_LOADED){
    loadInputs()
  }else if(stageName == stageEnum.INPUTS){
    tearDownInputs()
    loadLineDelineation(stageOutput)
  }else if(stageName == stageEnum.LINE_DELINEATION){
    tearDownLineDelineation()
    loadStageDirections(stageOutput)
  }else if(stageName == stageEnum.STAGE_DIRECTIONS){
    tearDownStageDirections()
    loadEntrances(stageOutput)
  }else if(stageName == stageEnum.ENTRANCES){
    tearDownEntrances()
    loadPMLOuptut(stageOutput)
  }else if(stageName == stageEnum.PML_OUTPUT){
    tearDownPMLOutput()
    loadInputs(stageOutput)
  }
}

// functions responsible for clearing all of the divs that stage
// set up from the page
function tearDownInputs(){
  markupInput.teardownStage()
}

function tearDownLineDelineation(){
  lineDelineation.teardownStage()
}

function  tearDownStageDirections(){
  stageDirection.teardownStage()
}

function tearDownEntrances(){
  entrancesExits.teardownStage()
}

function tearDownPMLOutput(){
  pmlOutput.teardownStage()
}


// functions responsible for loading in interfaces for the next stage
function loadInputs(stageOutput){
  markupInput.loadStage({})
}

function loadLineDelineation(stageOutput){
  lineDelineation.loadStage(stageOutput)
}

function loadStageDirections(stageOutput){
  stageDirection.loadStage(stageOutput)
}

function loadEntrances(stageOutput){
  entrancesExits.loadStage(stageOutput)
}

function loadPMLOuptut(stageOutput){
  pmlOutput.loadStage(stageOutput)
}

stageComplete(stageEnum.PAGE_LOADED, {})