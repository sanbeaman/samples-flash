/*******************************************************************************
perception.js

Routines for launching and returning from a Perception test.

There are three different test types: pretest, testout, and test. The test
type is designated in the manifest.

The score on a testout can be replicated/assigned to other quizzes in the course.
To do so, the objective IDs for those quizzes must be designated in the manifest.

To designate the test type and quiz IDs (for a testout), use the following
method:

<adlcp:dataFromLMS>type=testout;quizzes=ID1,ID2,ID3</adlcp:dataFromLMS>

For other test types, use the following:

<adlcp:dataFromLMS>type=pretest</adlcp:dataFromLMS>

Gary Weinfurther, 1/28/2009
*******************************************************************************/

/*---------------------------------------------------------------
 Marks the current SCO complete and continues to the next SCO.
----------------------------------------------------------------*/
function TakeCourse()
{
	if (!LMSInitialize())
	{
		alert("Unable to initialize SCORM");
		return;
	}
	else
	{
		LMSMarkScoComplete();
		LMSSetValue("adl.nav.request", "continue");
		LMSTerminate();
	}
}

/*---------------------------------------------------------------
Launches the test
----------------------------------------------------------------*/
function TakeTest()
{
	if (!LMSInitialize())
	{
		alert("Unable to initialize SCORM");
		return;
	}

	SetInitialCompletionStatus();

	document.location.href = AssessmentURL();
}

/*---------------------------------------------------------------
 Saves the score for the current test.
----------------------------------------------------------------*/
function SaveTest()
{
	if (LMSInitialize())
	{
		SaveScore();
		LMSSetValue("adl.nav.request", "continue");
		LMSCommit();
		LMSTerminate();
	}
	else
		alert("Unable to initialize SCORM");
}

/*---------------------------------------------------------------
Sets the initial completion status for this SCO
----------------------------------------------------------------*/
function SetInitialCompletionStatus()
{
	var completionStatus = LMSGetValue("cmi.completion_status");

	if (completionStatus != "completed" && completionStatus != "incomplete" )
	{
		LMSSetValue("cmi.completion_status", "incomplete");
		LMSCommit();
	}
}

/*---------------------------------------------------------------
 Saves the score for the test to the LMS.
----------------------------------------------------------------*/
function SaveScore()
{
	var score = GetScore();
  var scaledscore = score / 100.0;

	LMSSetValue("cmi.score.raw",    score);
	LMSSetValue("cmi.score.scaled", scaledscore);
  LMSSetObjectiveScore("primary", score, scaledscore);

	PerformTestCompletion(score);
}

/*---------------------------------------------------------------
 Returns the test score from Perception.
----------------------------------------------------------------*/
function GetScore()
{
	var score		= 0;
	var learnerId	= LMSGetValue("cmi.learner_id");
	var launchData	= new ParameterParser(LMSGetValue("cmi.launch_data"));

	if (launchData.Get("cheat") == "yes" && learnerId == "gweinfurther")
	{
		score = 100;
	}
	else
	{
		var urlParameters	= new ParameterParser(document.location.search);
		var scoreString		= urlParameters.Get("SCORE");
		var parsedScore		= parseInt(scoreString, 10);

		if (!isNaN(parsedScore))
			score = parsedScore;
	}

	return score;
}

/*---------------------------------------------------------------
 Performs SCO completion requirements for the type of test.
----------------------------------------------------------------*/
function PerformTestCompletion(score)
{
	var launchData	= new ParameterParser(LMSGetValue("cmi.launch_data"));
	var testType	= launchData.Get("type");

	switch(testType)
	{
		case "pretest":
			PretestCompletion();
			break;

		case "testout":
			TestoutCompletion(score);
			break;

		default:
			TestCompletion(score);
			break;
	}
}

/*---------------------------------------------------------------
 When a pretest is done, all objectives are marked complete,
 regardless of the score.
----------------------------------------------------------------*/
function PretestCompletion()
{
	LMSMarkAllComplete();
}

/*---------------------------------------------------------------
When a test-out is done, the primary objective is marked
complete. If the test-out was passed, then all other objectives
are marked complete, as well. the test score is replicated
to any other quiz objectives provided in the manifest.
----------------------------------------------------------------*/
function TestoutCompletion(score)
{
	LMSMarkScoComplete();

	if (score >= 80)
	{
		LMSMarkObjectivesComplete();
	}
}

/*---------------------------------------------------------------
When a normal test or quiz is done, it is marked complete
only if it was passed.
----------------------------------------------------------------*/
function TestCompletion(score)
{
	if (score >= 80)
		LMSMarkAllComplete();
	else
		LMSSetValue("cmi.completion_status", "incomplete");
}

/*---------------------------------------------------------------
 Assigns the score to all associated quizzes so that they
 will be automatically bookmarked.

 To do this, we loop through all the objectives for this SCO
 and if any of them match the given quiz IDs, we save the score
 in those objectives.
----------------------------------------------------------------*/
function SetQuizScores(score, quizString)
{
	var quizzes		= quizString.split(",");
	var countString = LMSGetValue("cmi.objectives._count");
	var count       = parseInt( countString, 10 );
	var scaledScore	= score / 100.0;

	for(var i = 0; i < count; ++i)
	{
		// As a test, let's try writing the score to *all* objectives assigned
		// to this SCO. If writeNormalizedMeasure="false", it should
		// not actually write the score, right?
		// If so, then we can remove all the Quiz ID logic.

		//var id = LMSGetValue("cmi.objectives." + i + ".id");
		//
		//if (InArray(quizzes, id))
		//{
			LMSSetValue("cmi.objectives." + i + ".score.raw",    score);
			LMSSetValue("cmi.objectives." + i + ".score.scaled", scaledScore);
		//}
	}
}

/*---------------------------------------------------------------
 Returns the URL for launching the test
----------------------------------------------------------------*/
function AssessmentURL()
{
	var BASE_URL    = "http://perception.dcxdca.com/q/session.dll";
	var learnerData	= new ParameterParser(LMSGetValue("cmi.launch_data"));
	var session     = learnerData.Get("id");
	var learnerId   = LMSGetValue("cmi.learner_id");
	var learnerName = LMSGetValue("cmi.learner_name");
	var returnURL	= BuildReturnURL("testcomplete.html");

	href = BASE_URL + '?CALL=SCORM' +
			'&SESSION=' + session +
			'&NAME=' + escape(learnerId) +
			'&HOME=' + escape(returnURL);

	if (learnerName != "")
		href += '&DETAILS=' + escape(learnerName);

	return href;
}

/*---------------------------------------------------------------
 Returns the URL that Perception should return to when finished.
----------------------------------------------------------------*/
function BuildReturnURL(page)
{
	var url = "http://" + location.hostname + location.pathname;

	var parts = url.split("/");
	parts[parts.length - 1] = page;

	return parts.join("/");
}

/*---------------------------------------------------------------
 Returns true if any element in <anArray> matches <item>.
----------------------------------------------------------------*/
function InArray(anArray, item)
{
	for (var i = anArray.length - 1; i >= 0; --i)
		if (anArray[i] == item)
			return true;

	return false;
}
