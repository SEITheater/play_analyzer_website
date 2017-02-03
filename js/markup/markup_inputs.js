class MarkupInput{
  constructor(){
    this.characterList = []
    this.fullText = ""
    this.delineateMap = []
    this.characterListClickCount = 0
    this.rawTextClickCount = 0
    var context = this;
  }


  loadStage(previousStageOuptut){
    var context = this;

    $("#characterList").click(function(){
      if(context.characterListClickCount == 0){
        $("#characterList").val("")
        context.characterListClickCount += 1
      }
    })
    
    $("#rawText").click(function(){
      if(context.rawTextClickCount == 0){
        $("#rawText").val("")
        context.rawTextClickCount += 1
      }
    })

    // Annonymous callback allows for proper 'this' scope
    $("#submitCharacters").click(function(){
      context.charactersTransition()
    })
    $("#charactersBack").click(function(){
      context.charactersTransition()
    })
    $("#submitRawText").click(function(){
      context.textSubmitted()
    })
  }

  teardownStage(){
    $("#intro").hide()
    $("#sceneText").hide()

    $("#characterList").off("click")
    $("#rawText").off("click")
    $("#submitCharacters").off("click")
    $("#charactersBack").off("click")
    $("#submitRawText").off("click")

  }

  // Processing functions
  createDelineateMap(){
    this.fullText = $("#rawText").val()
    var lowerCaseText = this.fullText.toLowerCase()
    var lowerCaseCharacters = []
    for(var key in this.characterList){
      lowerCaseCharacters.push(this.characterList[key].toLowerCase())
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
          this.delineateMap.push({"character": this.characterList[key],
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
    this.delineateMap.sort(sortMap)

  }


  // Transition functions
  charactersTransition(){
    $("#intro").toggle()
    $("#sceneText").toggle()
    this.characterList = []
    var tmpCharacterList = $("#characterList").val().split(",")
    for(var key in tmpCharacterList){
      var entry = tmpCharacterList[key]
      this.characterList.push(entry.trim())
    }
  }

  textSubmitted(){
    var sceneNumber = parseInt($("#sceneNum").val())
    var actNumber = parseInt($("#actNum").val())
    if(actNumber <= -1 || sceneNumber <= -1){
      $("#asFailMessage").html("It appears you didn't set an act or scene number for this text.")
      return
    }
    this.createDelineateMap()
    stageComplete(stageEnum.INPUTS, this.delineateMap)
  }
}