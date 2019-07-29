if(typeof akatm == "undefined"){var akatm = {};};
if(typeof akatm.utils == "undefined"){akatm.utils = {};};

akatm.utils.getQueryParam = function(paramName){
	var p = paramName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+p+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null )
		return "";
	else
		return results[1];
}

akatm.utils.trim = function(str) { 
	return str.replace(/^\s+|\s+$/g, ''); 
};

akatm.utils.contains = function(value, array) { 
   for (var i in array) { 
   		if (array[i] === value) 
				return true; 
   } 
   return false; 
};

akatm.utils.stringify = function(obj) { 
   if (typeof obj === 'object') { 
   		var out = []; 
   		if (obj.push) { 
   			// Array. 
   			for (var p in obj) out.push(obj[p]); 
   				return '[' + out.join(',') + ']'; 
   		} else { 
   			// Other object. 
   			for (var p in obj) out.push("'" + p + "': " + obj[p]); 
   				return '{' + out.join(',') + '}'; 
   		} 
   } else 
			return String(obj); 
};

akatm.utils.roundDecimals = function(num, noOfPrecisions){
	var precision = Math.pow(10,noOfPrecisions);
    return Math.round(num * precision) / precision;
}

/*
    nStr : This is the number to be formatted. This might be a number or a string. No validation is done on this input.
    inD : This is the decimal character for the string. This is usually a dot but might be something else.
    outD : This is what to change the decimal character into.
    sep : This is the separator, which is usually a comma.
*/
akatm.utils.addSeparatorsNF = function(nStr, inD, outD, sep)
{
	nStr += '';
	var dpos = nStr.indexOf(inD);
	var nStrEnd = '';
	if (dpos != -1) {
		nStrEnd = outD + nStr.substring(dpos + 1, nStr.length);
		nStr = nStr.substring(0, dpos);
	}
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(nStr)) {
		nStr = nStr.replace(rgx, '$1' + sep + '$2');
	}
	return nStr + nStrEnd;
}

akatm.utils.FormatAsThousands = function(amount, noOfPrecisions){
	amount = (noOfPrecisions > 0) ? akatm.utils.roundDecimals(amount, noOfPrecisions) : Math.round(amount);
	
	return akatm.utils.addSeparatorsNF(amount,'.','.',',');
}

/**
 * Formats the currency based the type and precesions.
 * @param {Number} amount : Currency
 * @param {Number} noOfPrecisions : Number of decimal characters to be allowed.
 * @return {String|Optional} type : Type of the cunversion and default will be thousands.The possible values are 
 						  "B" -> Billion
 						  "M" -> Million
 */
akatm.utils.formatCurrency = function(amount, noOfPrecisions, type){	
	var den = 1;suffix = "";
	switch(type){
		case 'B': den *= 1000;
		case 'M': den *= 1000000;break;
	}
	if (amount/den >= 1 && type) {
		amount = amount/den;
		suffix = type;
	}
	amount = (noOfPrecisions > 0) ? akatm.utils.roundDecimals(amount, noOfPrecisions) : Math.round(amount);
	return akatm.utils.addSeparatorsNF(amount,'.','.',',') + suffix;
}

akatm.utils.get2Digit = function(n){
	if (n==0)
		return "00";
	else if(n < 10 && n > 0)
		return "0" + n;
	else
		return "" + n;
}

akatm.utils.formatTime = function(secs){
	var hour = Math.floor(secs/3600);
	secs -= (hour * 3600);
	var min = Math.floor(secs/60);
	secs -= (min * 60);

	//console.log("S:"+secs+",M:"+min+", H:"+hour);
	return akatm.utils.get2Digit(hour) + ":" + akatm.utils.get2Digit(min) + ":" + akatm.utils.get2Digit(secs);
}

/*	
Usage: wordwrap('The quick brown fox jumped over the lazy dog.', 20, '<br/>\n');
*/
akatm.utils.wordwrap = function( string, width, breakString, cut ) {
    brk = brk || '\n';
    width = width || 75;
    cut = cut || false;
 
    if (!str) { return str; }
 
    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
 
    return str.match( RegExp(regex, 'g') ).join( brk );
 
}

/*
Usage: getSmallMonth(<month_number>) month_number represented in 0 based index.
*/
akatm.utils.getSmallMonth = function(num){
	var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return m[num];
}

akatm.utils.getNth = function(d){
	if(d>3 && d<21) return 'th'; // thanks kennebec
  switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

akatm.utils.isMobile = {
    Android:    function() {return navigator.userAgent.match(/Android/i) ? true : false;},
    BlackBerry: function() {return navigator.userAgent.match(/BlackBerry/i) ? true : false;},
    iOS:        function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;},
    iPhone:     function() {return navigator.userAgent.match(/iPhone/i) ? true : false;},
    Windows:    function() {return navigator.userAgent.match(/IEMobile/i) ? true : false;},
    any:        function() {return (akatm.utils.isMobile.Android() || akatm.utils.isMobile.BlackBerry() || akatm.utils.isMobile.iOS() || akatm.utils.isMobile.Windows());}
};

akatm.utils.roundToThousands = function (n, noOfPrecisions, isByte) {
    if (n <= 0) return n;

    var units = (isByte) ? ['K', 'M', 'G', 'T', 'P', 'Z'] : ['K', 'M', 'B', 'T'], i = 0;
    while (n > 999) {
        n /= 1000;
        if (i++ >= units.length) break;
    }

    if (i > 0)
        return akatm.utils.FormatAsThousands(n, noOfPrecisions) + units[--i];
    else
        return akatm.utils.roundDecimals(n, noOfPrecisions);
};