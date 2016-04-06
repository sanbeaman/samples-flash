/*******************************************************************************
 survey.js
 Routines for lauching a survey.

 Gary Weinfurther, 11/12/2007
 Modified by Stephen C. Fedder, 08/19/2011
*******************************************************************************/

/*---------------------------------------------------------------
 Launches the survey only if it has not already been seen.
 The survey ID will be in a query parameter named "survey".
----------------------------------------------------------------*/
function DoSurvey() {
	if (!LMSInitialize()) {
		alert("Unable to initialize SCORM");
		return;
	}
	if (!IsSurveyCompleted()) {
		LaunchSurvey();
		SetSurveyCompleted();
	}
	LMSTerminate();
}

/*---------------------------------------------------------------
 Launches the survey
----------------------------------------------------------------*/
function LaunchSurvey() {
	var learnerData=new ParameterParser(LMSGetValue("cmi.launch_data"));
	var survey=learnerData.Get("survey");
	var cutoffdate=learnerData.Get("cutoffdate");
	var learner=LMSGetValue("cmi.learner_id");
	if (survey!="") {
		var bLaunch=true;
		if (cutoffdate!="") {
			var dateCutOff=new Date(cutoffdate);
			var currentDate=new Date();
			if (dateCutOff<currentDate) {
				bLaunch=false;
			}
		}
		if (bLaunch) {
  		var url="http://perception.chrysleracademy.com/em/mcgcaller/SurveyCaller.asp"+
  			"?strSurveyID="+survey+"&strSID="+learner;
  		window.open(url,"survey","width=982,height=708,top=0,left=0,scrollbars=yes");
		}
	}
}

/*---------------------------------------------------------------
 Returns true if the survey launch has already been completed.
----------------------------------------------------------------*/
function IsSurveyCompleted() {
	var result=false;
	if (LMSInitialize()) {
		var completed=LMSGetValue("cmi.completion_status");
		result=completed=="completed";
	}
	return result;
}

/*---------------------------------------------------------------
 Marks the survey launch completed.
----------------------------------------------------------------*/
function SetSurveyCompleted() {
	LMSMarkAllComplete();
	LMSCommit();
}

/*---------------------------------------------------------------
 Hides the specified HTML element if the survey has been completed.
----------------------------------------------------------------*/
function HideIfSurveyCompleted(elementID)
{
	var element = document.getElementById(elementID);

	if (element && IsSurveyCompleted())
		element.style.display = "none";
}
