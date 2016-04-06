/*******************************************************************************
ParameterParser.js
A class to parse a string of name-value pairs.

Gary Weinfurther, 1/29/2009
*******************************************************************************/

function ParameterParser(paramstring, delimiter)
{
	this.parameters = new Object();
	this.delimiter	= delimiter == undefined ? /[?&;]/ : delimiter;

	if (paramstring != undefined)
		this.Parse(paramstring);
}

/*---------------------------------------------------------------
Parses and extracts all the parameters in the given string.
----------------------------------------------------------------*/
ParameterParser.prototype.Parse = function(paramstring, delimiter)
{
	var parts = paramstring.split(this.delimiter);

	for (var i = parts.length - 1; i >= 0; --i)
	{
		if (parts[i].indexOf("=") > 0)
		{
			var pair  = parts[i].split("=");
			var key   = pair[0];
			var value = pair[1];
			
			this.parameters[key.toLowerCase()] = unescape(value);
		}
	}
}

/*---------------------------------------------------------------
Returns the value of the specified parameter
----------------------------------------------------------------*/
ParameterParser.prototype.Get = function (name)
{
	name = name.toLowerCase();

	return this.parameters[name] ? this.parameters[name] : "";
}
