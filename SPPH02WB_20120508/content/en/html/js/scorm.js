/*******************************************************************************
 scorm.js
 High-level SCORM interface functions.

 Gary Weinfurther, 9/27/2007
 10/11/2007 - GW: If the SCORM API is not found, uses the cookie API instead.
 02/08/2011 - SCF: added LMSGetObjectiveStatus and commented out some window.status settings
*******************************************************************************/

var SCORM_ALERTS = false;	// Set this to false to turn user alerts off
var SCORM_TRACE  = false;	// Set this to false to turn trace messages off

// Define exception/error codes
var SCORM_ERR_NO_ERROR             = 0;
var SCORM_ERR_GENERAL_ERROR        = 101;
var SCORM_ERR_INITIALIZATION_ERROR = 102;
var SCORM_ERR_ALREADY_INITIALIZED  = 103;

var ScormApi = null;	// The scorm interface object
var ScormIsInitialized = false;	// Has SCORM been initialized?

/*---------------------------------------------------------------
 Initializes communication with LMS by locating the API object
 and calling the API's Initialize method. If the API object is
 not found, the cookie API is used instead.

 Rturns true if successful, otherwise false.
----------------------------------------------------------------*/
function LMSInitialize()
{
	if (ScormIsInitialized == true && ScormApi != null)
		return true;

	ScormApi = LMSFindApi();

	if (ScormApi == null)
	{
		ScormApi = new ScormCookies();
		//window.status = "Using cookies";
		//alert("SCORM API not found.\nYour progress will saved on your computer, not on the LMS.");
	}
	else
	{
		//window.status = "Using LMS";
	}

	var result  = ScormApi.Initialize("");
	var success = LMSDetermineSuccess(result);

	if (success)
		ScormIsInitialized = true;
	else
		LMSShowError("Initialize");

	return success;
}

/*---------------------------------------------------------------
 Returns true if initialization was successful.
----------------------------------------------------------------*/
function LMSDetermineSuccess(ScormResult)
{
	if (ScormResult == "true")
		return true;

	var lastError = LMSGetLastError();

	if (lastError == SCORM_ERR_ALREADY_INITIALIZED)
		return true;

	return false;
}

/*---------------------------------------------------------------
 Closes communication with LMS.
 Returns true if successful, false if failed.
----------------------------------------------------------------*/
function LMSTerminate()
{
	var result = false;

	if (ScormIsInitialized)
	{
		var value = ScormApi.Terminate("");

		result = (value == "true");

		if (result)
			ScormIsInitialized = false;
		else
			LMSShowError("Terminate");
	}

	return true;
}

/*---------------------------------------------------------------
 Retrieves a named data element from the LMS.
----------------------------------------------------------------*/
function LMSGetValue(name)
{
	var result    = "";
	var value     = ScormApi.GetValue(name);
	var errorCode = ScormApi.GetLastError();

	if (errorCode == "0")
		result = value;
	else
		LMSShowError("GetValue(" + name + ") value=[" + value + "]\n");

	//alert("LMSGetValue(" + name + ")=" + result);
	return result;
}

/*---------------------------------------------------------------
 Stores a new value for a named LMS data element.
 Returns true if successful, false if failed.
----------------------------------------------------------------*/
function LMSSetValue(name, value)
{
	//window.top.status = LMSGetValue("cmi.learner_id") + " SetValue " + name + "=" + value;

	//if (value == "null")
	//	alert("Received null: LMSSetValue(" + name + ",null)");
  if (value == "null")
    value = "";

	if (value == "undefined")
		value = "";

	var result  = ScormApi.SetValue(name, value);
	var success = result == "true";

	if (!success)
		LMSShowError("SetValue(" + name + "," + value + ")");

	return success;
}

/*---------------------------------------------------------------
 Marks the SCO completed and passed, and marks all objectives
 completed.
----------------------------------------------------------------*/
function LMSMarkAllComplete(score)
{
	//alert("LMSMarkAllComplete");
	LMSMarkObjectivesComplete();
	LMSMarkScoComplete();
	return true;
}

/*---------------------------------------------------------------
 Marks the SCO completed and passed
----------------------------------------------------------------*/
function LMSMarkScoComplete()
{
	LMSSetValue("cmi.completion_status", "completed");
	LMSSetValue("cmi.success_status",    "passed");
	return true;
}

/*---------------------------------------------------------------
 Marks all objectives completed.
----------------------------------------------------------------*/
function LMSMarkObjectivesComplete()
{
	var countString = LMSGetValue("cmi.objectives._count");
	var count       = parseInt( countString, 10 );

	if (isNaN(count))
		return true;

	for(var i = 0; i < count; ++i)
	{
		LMSSetValue("cmi.objectives." + i + ".completion_status", "completed");
		LMSSetValue("cmi.objectives." + i + ".success_status",    "passed");
	}

	return true;
}

/*---------------------------------------------------------------
 Marks a specific objective passed or failed
----------------------------------------------------------------*/
function LMSSetObjectiveSuccess(objID, status)
{
	var index = LMSFindObjectiveIndex(objID);

	if (index != -1)
	{
		LMSSetValue("cmi.objectives." + index + ".success_status", status);
	}

	return true;
}

/*---------------------------------------------------------------
 Get the status of a specific objective (SCF)
----------------------------------------------------------------*/
function LMSGetObjectiveStatus(objID) {
	var index=LMSFindObjectiveIndex(objID); if (index!=-1) {
		return LMSGetValue("cmi.objectives."+index+".completion_status");
	}
	return "unknown";
}

/*---------------------------------------------------------------
 Marks a specific objective passed or failed
----------------------------------------------------------------*/
function LMSSetObjectiveScore(objID, rawScore, scaledScore)
{
	var index = LMSFindObjectiveIndex(objID);

	if (index != -1)
	{
		LMSSetValue("cmi.objectives." + index + ".score.raw", rawScore);
		LMSSetValue("cmi.objectives." + index + ".score.scaled", scaledScore);
	}

	return true;
}

/*---------------------------------------------------------------
 Returns the index of a specific objective ID.
 Returns -1 if the objective ID was not found.
----------------------------------------------------------------*/
function LMSFindObjectiveIndex(objID)
{
	var countString = LMSGetValue("cmi.objectives._count");
	var count       = parseInt( countString, 10 );

	if (isNaN(count))
		return -1;

	for(var i = 0; i < count; ++i)
	{
		if(objID == LMSGetValue("cmi.objectives." + i + ".id"))
			return i;
	}

	return -1;
}

/*---------------------------------------------------------------
 Copies the SCO's score to all objectives
----------------------------------------------------------------*/
function LMSCopyScoreToObjectives()
{
	var rawScore	= LMSGetValue("cmi.score.raw");
	var scaledScore	= LMSGetValue("cmi.score.scaled");
	var countString	= LMSGetValue("cmi.objectives._count");
	var count		= parseInt( countString, 10 );

	if (isNaN(count))
		return true;

	for(var i = 0; i < count; ++i)
	{
		LMSSetValue("cmi.objectives." + i + ".score.raw",		rawScore);
		LMSSetValue("cmi.objectives." + i + ".score.scaled",	scaledScore);
	}

	return true;
}

/*---------------------------------------------------------------
 Commits all SCORM values.
 Returns true if successful, false if failed
----------------------------------------------------------------*/
function LMSCommit()
{
	var result  = ScormApi.Commit("");
	var success = result == "true";

	if (!success)
		LMSShowError("Commit");

	return success;
}

/*---------------------------------------------------------------
 Returns the error code that was set by the last LMS function call.
----------------------------------------------------------------*/
function LMSGetLastError()
{
	return ScormApi.GetLastError();
}

/*---------------------------------------------------------------
 Returns the textual description that corresponds to the given
 error code.
----------------------------------------------------------------*/
function LMSGetErrorString(errorCode)
{
	return ScormApi.GetErrorString(errorCode).toString();
}

/*---------------------------------------------------------------
 Returns the LMS-specific detailed description that corresponds
 to the input error code.
----------------------------------------------------------------*/
function LMSGetDiagnostic(errorCode)
{
	return ScormApi.GetDiagnostic(errorCode).toString();
}

/*-------------------------------------------------------------
 Function LMSShowError()
 Inputs:  None
 Return:  The current value of the LMS Error Code

 Description:
 Determines if an error was encountered by the previous ScormApi
 call and if so, displays a message to the user.  If the error
 code has associated text it is also displayed.
---------------------------------------------------------------*/
function LMSShowError(prefix)
{
   if (SCORM_ALERTS == true)
   {
	   var errorCode = ScormApi.GetLastError();

	   if (errorCode != "0")
	   {
	      // an error was encountered so display the error description
	      var description = "SCORM error " + errorCode
						  +	"\n" + ScormApi.GetErrorString(errorCode)
						  + "\n" + ScormApi.GetDiagnostic(errorCode);

	      LMSAlert(prefix + ": " + description);
	   }
	}
}

/*----------------------------------------------------------------
 Function FindScormApi()
 Inputs:  none
 Return:  If a SCORM API object is found, it is returned,
          otherwise null is returned

 Description:
 Locates the SCORM API object within the browser window hierarchy.
------------------------------------------------------------------*/
function LMSFindApi()
{
	var tries  = 100;
	var win    = window;

	while (win != null && --tries > 0)
	{
		if (win.API_1484_11 != null)
			return win.API_1484_11;

		if (win.parent == null || win.parent == win)
			win = win.opener;
		else
			win = win.parent;
	}

   return null;
}

/*----------------------------------------------------------------
 Function LMSAlert()
 Inputs:  msg : A text message to display
 Return:  nothing

 Description:
 Displays an alert message, but only if SCORM_ALERTS is true.
------------------------------------------------------------------*/
function LMSAlert(msg)
{
	if (SCORM_ALERTS)
		alert(msg);
}

/*----------------------------------------------------------------
 Function LMSTrace()
 Inputs:  msg : A text message to display
 Return:  nothing

 Description:
 Displays an alert message, but only if SCORM_TRACE is true.
------------------------------------------------------------------*/
function LMSTrace(msg)
{
	window.top.status = msg;
}

