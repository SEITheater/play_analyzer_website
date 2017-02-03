class Header{
  constructor(){
    var context = this;
    $(".makeHeaderClick").click(function(){
    	context.makeHeader()
    })
  }

  makeHeader(){
  	var context = this;
	  $("#intro").hide()
	  $("#markupComplete").hide()
	  $("#makeHeader").show()
	  $("#titleInput").on('paste, keyup', function(){
	  	context.updateHeaderOutput()
	  })
	  $("#authorInput").on('paste, keyup', function(){
	  	context.updateHeaderOutput()
	  })
	  $(document).click(function(){
	    context.updateHeaderOutput()
	  })
	}

	updateHeaderOutput(){
	  var titleVal = $("#titleInput").val()
	  var authorVal = $("#authorInput").val()
	  var pmlString = '@v{"version": 0.1}\n @play{"title":"'
	                + titleVal + '"}, "author": "' + authorVal + '"}\n'
	  $("#headerOutput").html(pmlString)
	}
}