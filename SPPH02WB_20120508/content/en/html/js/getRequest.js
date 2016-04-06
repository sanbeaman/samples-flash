
function writeFlashEmbed(indexID) {
    var objID = getRequest("OID");
	var scoreVal = getRequest("score");
    var strHTML = '<object id="swfSCO" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
    strHTML += 'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" ';
    strHTML += 'width="755" height="618"> ';
	strHTML += '<param name="movie" value="_globals/shell_cgt.swf" />';
	strHTML += '<param name="FlashVars" value="gNodeID='+indexID+'&gDebugMode=false&objID='+objID+'&score='+scoreVal+'" /> ';
    strHTML += '<param name="base" value="./_globals" /> ';
    strHTML += '<param name="wmode" value="transparent" /> ';
    strHTML += '<param name="allowScriptAccess" value="sameDomain" />';
    strHTML += '<param name="quality" value="high" /> <param name="bgcolor" value="#ffffff" /> ';
	strHTML += '<EMBED src="_globals/shell_cgt.swf" ';
    strHTML += 'base="./_globals" ';
    strHTML += 'FlashVars="gNodeID='+indexID+'&gDebugMode=false&objID='+objID+'&score='+scoreVal+'" ';
    strHTML += 'WIDTH="755" HEIGHT="618" wmode="transparent" ';
    strHTML += 'NAME="swfSCO" ALIGN="c" TYPE="application/x-shockwave-flash" PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer" /> ';
	strHTML += '</object>';
    document.write(strHTML);
}

function getRequest(name)
{
    var sParms = unescape(document.location.search.substr(1));
    var aParms = sParms.split("&");
    var iNumParms = aParms.length;
    for (iParm = 0; iParm < iNumParms; iParm++) {
        sParmName = aParms[iParm].split("=")[0];
        sParmValue = aParms[iParm].split("=")[1];
        if (name.toUpperCase() == sParmName.toUpperCase()) {
            return unescape(sParmValue);
        }
    }
    return "-1";
}

//utilities functions
function writeObjectives()
   {
	var numOfObj = doGetValue("cmi.objectives._count");

	myWindow = window.open("", "objectives", 'toolbar,width=400,height=400') 
	myWindow.document.writeln ("Number of Objectives:" + numOfObj);
	
	for ( var i=0; i < numOfObj; i++ ) 
	   {
          myWindow.document.writeln ("<p>Objective ID #" + i + ": " + doGetValue("cmi.objectives." + i + ".id"));
		  myWindow.document.writeln ("<br>Objective ID #" + i + " success status: " + doGetValue("cmi.objectives." + i + ".success_status"));
	   }
	}
	

   
   function completeAndPass()
   {
	
	document.examForm.submitButton.disabled = true;
      
      
      //  Set the SCO to completed and passed with a normal exit
      //  This will set the Primary Objective Progress Status to true (for sequencing)
      //  This will set the Primary Objective Success Status to true (for sequencing)
      doSetValue( "cmi.completion_status", "completed" );
      doSetValue( "cmi.success_status", "passed" );
      doSetValue( "cmi.exit", "" );
      doSetValue( "adl.nav.request", "continue" );

      //  Indicate that the SCO was finished normally
      exitPageStatus = true;
  
      var result = doTerminate();
   }
   
   
   
   
   /**********************************************************************
   **  Function: loadPage()
   **  Description: This is called when a SCO is first loaded in the
   **               browser (onload()).  It finds the API if it was not
   **               already located and calls Initialize().  In
   **               the exitPageStatus global variable is set to false
   **               indicating that the SCO is not yet finished.
   **********************************************************************/
   function loadPage()
   {
      var result = doInitialize();
      exitPageStatus = false;

   }
   
   /**********************************************************************
   **  Function: doQuit()
   **  Description: This function is called in the case that the user
   **               does not finish the SCO "gracefully".  For example, 
   **               the user may click the "continue" button before
   **               submitting an answer to a question.  In this case,
   **               this function is called as part of the page unloading.
   **               This function ensures that Terminate() is called
   **               and that the correct statuses are set even if the 
   **               user closes the SCO window or navigates away before 
   **               finishing the SCO.
   **********************************************************************/
   function doQuit()
   {   
       doTerminate();
   }

   /**********************************************************************
   **  Function: doQuit()
   **  Description: This function is called in the case that the user
   **               does not finish the SCO "gracefully".  For example, 
   **               the user may click the "continue" button before
   **               submitting an answer to a question.  In this case,
   **               this function is called as part of the page unloading.
   **               This function ensures that Terminate() is called
   **               even if the user closes the SCO window or navigates
   **               away before finishing the SCO.
   **********************************************************************/
   function unloadPage()
   {
    
   	if (exitPageStatus != true)
   	{
   		doQuit();
   	}
   
   	// NOTE: don't return anything that resembles a javascript
   	//		   string from this function or IE will take the
   	//		   liberty of displaying a confirm message box
   }
   
  
   /**********************************************************************
    **  Function: findObjective()
    **  Description: This function is used to find the approriate
    **               objective (using the identifier).
    **********************************************************************/
   function findObjective(obj)
   {
	   var numOfObj = doGetValue("cmi.objectives._count");
	   var objectiveLocation = -1;

	   for ( var i=0; i < numOfObj; i++ ) 
	   {
          if ( doGetValue("cmi.objectives." + i + ".id") == obj )
		  {
			 objectiveLocation = i;
			 break;
		  }
	   }
      
      if ( objectiveLocation == -1 ) 
      {
//alert("objective not found");
         objectiveLocation = numOfObj;
//alert("setting index " + numOfObj + " -- and id to " + obj);
         doSetValue( "cmi.objectives." + objectiveLocation + ".id", obj);
      }

	   return objectiveLocation;
   }

   /**********************************************************************
   **  Function: setObjToPassed()
   **  Description: This function sets the objective at the given index
   **               to passed
   **********************************************************************/
   function setObjToPassed(index)
   {
      doSetValue("cmi.objectives." + index + ".success_status",
			  "passed");
      doSetValue("cmi.objectives." + index + ".score.scaled",
			  "1.0");
   }

   /**********************************************************************
   **  Function: setObjToFailed()
   **  Description: This function sets the objective at the given index
   **               to failed
   **********************************************************************/
   function setObjToFailed(index)
   {
      doSetValue("cmi.objectives." + index + ".success_status",
			   "failed");
      doSetValue("cmi.objectives." + index + ".score.scaled",
			  "0.0");
   }

    function SetAllObjectivesPassed()
    {
        var xx = 0;
        var sObjCount = retrieveDataValue("cmi.objectives._count");
        
        while (xx < sObjCount)
        {
            storeDataValue("cmi.objectives."+xx + ".success_status", "passed");
            xx++;
        }

    }

   function setSCOPass(objID)
   {
	   //removed 041307 following not setting obj in scripts ruls
		//var objLocation = findObjective(objID);
		//setObjToPassed(objLocation);

		//objLocation = findObjective("course_complete");
		//setObjToPassed(objLocation);
		SetAllObjectivesPassed();

   }

   function setSCOFailed(objID)
   {
		var objLocation = findObjective(objID);
		setObjToFailed(objLocation);

   }

    function setSCOComplete()
   {
      doSetValue( "cmi.completion_status", "completed" );
      doSetValue( "cmi.exit", "" );
      doSetValue( "adl.nav.request", "continue" );
      doCommit("");
   }

    function doneClicked()
   {
	  doSetValue( "adl.nav.request", "continue" );
      //  Indicate that the SCO was finished normally
      exitPageStatus = true;
	  doCommit("");
	//writeObjectives();
      var result = doTerminate();
   }