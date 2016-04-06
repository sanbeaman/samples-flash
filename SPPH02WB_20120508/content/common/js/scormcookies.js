/*******************************************************************************
 scormcookies.js
 Defines the ScormCookies class, which acts as a surrogate SCORM API interface
 but uses cookies for storage. This class uses the same interface as the
 SCORM API object, and so can be used interchangeably. However, not all of
 the class methods perform any actual function.

 Gary Weinfurther, 10/11/2007
*******************************************************************************/

function ScormCookies()
{
	this.className = "ScormCookies";
}

/*------------------------------------------------------------
 Returns the value of the given cookie, or an empty string
 if no cookie with the given name was found. This is a
 private function.

 name - Name of the cookie to retrieve
-------------------------------------------------------------*/
ScormCookies.prototype.GetCookie = function(name)
{
	var valuePairs = document.cookie.split(';');
	var count      = valuePairs.length;

	for(var i = 0; i < count; ++i)
	{
		var valuePair = valuePairs[i].split("=");

		// trim left/right whitespace from the name
		var itemname = valuePair[0].replace(/^\s+|\s+$/g, "");

		if (name == itemname)
		{
			if ( valuePair.length > 1 )
				return unescape( valuePair[1].replace(/^\s+|\s+$/g, '') );

			break;
		}
	}

	return "";
}

/*---------------------------------------------------------------
 Sets a cookie value. Optionally sets its expiration date.
 This is a private function.

 name  - Name of the cookie to assign
 value - Value of the cookie
 days  - (optional) The number of days until the cookie expires
----------------------------------------------------------------*/
ScormCookies.prototype.SetCookie = function(name, value, days)
{
	if (!days)
		days = 30;

	var date = new Date();
	date.setTime(date.getTime() + (days * 24*60*60*1000));
	var expires = "; expires=" + date.toGMTString();

	document.cookie = name + "=" + escape(value) + expires + "; path=/";
}

/*---------------------------------------------------------------
 Initializes communication with the LMS.
 Since we're just simulating an LMS, it will always return true.
----------------------------------------------------------------*/
ScormCookies.prototype.Initialize = function()
{
	return "true";
}

/*---------------------------------------------------------------
 Closes communication with LMS.
----------------------------------------------------------------*/
ScormCookies.prototype.Terminate = function()
{
	return "true";
}

/*---------------------------------------------------------------
 Retrieves a value from the LMS.
 name - string representing the cmi data element to retrieve
----------------------------------------------------------------*/
ScormCookies.prototype.GetValue = function(name)
{
	return this.GetCookie(name);
}

/*---------------------------------------------------------------
 Saves a data value to the LMS.
  name  - string representing the data element
  value - the value that the named element will be assigned
----------------------------------------------------------------*/
ScormCookies.prototype.SetValue = function(name, value)
{
	this.SetCookie(name, value);
	return "true";
}

/*---------------------------------------------------------------
 Commits all SCORM values.
----------------------------------------------------------------*/
ScormCookies.prototype.Commit = function()
{
	return "true";
}

/*---------------------------------------------------------------
 Returns the error code that was set by the last LMS function call.
----------------------------------------------------------------*/
ScormCookies.prototype.GetLastError = function()
{
	return "0";
}

/*---------------------------------------------------------------
 Returns the textual description that corresponds to the
 given error code.
----------------------------------------------------------------*/
ScormCookies.prototype.GetErrorString = function(errorCode)
{
	return "";
}

/*---------------------------------------------------------------
 Returns the detailed description that corresponds to the
 given error code.
----------------------------------------------------------------*/
ScormCookies.prototype.GetDiagnostic = function(errorCode)
{
	return "";
}
