<!--
/*
 * This file is part of the CCDN CommonBundle
 *
 * (c) CCDN (c) CodeConsortium <http://www.codeconsortium.com/> 
 * 
 * Available on github <http://www.github.com/codeconsortium/CommonBundle>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Plugin jQuery.TimeStamper
 *
 * @author Reece Fowell <reece at codeconsortium dot com>
 *
 * Create fuzzy timestamps that autoupdate as time progresses.
 *
 * Requires JQuery, make sure to have JQuery included in your JS to use this.
 * JQuery needs to be loaded before this script in order for it to work.
 */

$(document).ready(function() {
	$('abbr.timestamper').timestamper({ 
		interval: (1000 * 60 * 5),
	});
	
});

!function($) {

	//
	// TIMESTAMPER PLUGIN DEFINITION
	//
	$.fn.timestamper = function (params) {
		var iters = [];
		
		return this.each(function() {
			var $this = $(this);
			var obj = new Timestamper($this, params);
//			setInterval(function () {
//				refresh(obj);
//			}, 2000);
			setInterval($.proxy(obj.refresh,obj), obj.params.interval);
		});
			
	};
	
	//
	// TIMESTAMPER PUBLIC CLASS DEFINITION
	//
	var Timestamper = function (element, params) {
		this.init('timestamper', element, params);
	};
	
	Timestamper.prototype = {
		
		constructor: Timestamper,
		
		//
		// Default values.
		//
		defaults:  {
			interval: 10000,
			message: {
				just_now: 'less than a minute ago',
				min_1: '1 minute ago',
				min_x: '{IA} minutes ago',
				hour_1: '1 hour ago',
				hour_x: '{HA} hours ago',
				day_1: '{H}:{I} Yesterday',
				day_x: '{DA} days ago at {H}:{I}',
			},
			seconds: {
				inMinute: 60,
				inHour: (60 * 60),
				inDay: (60 * 60 * 24),
				inWeek: (60 * 60 * 24 * 7),
				inMonth: (60 * 60 * 24 * 7 * 4),
				inYear: (60 * 60 * 24 * 365)
			}
		},
		
		//
		// Initialise Object.
		// - Is called from the constructor.
		//
		init: function(type, element, params) {		
			// Setup config.
			this.params = this.defaults;
			this.mergeDefaultParams(this.params, params);

			// Save objects.
			this.element = element;

			// Prepare the date object from the timestamp date string.
			this.ts = this.dateStringToPrototype($(this.element).attr('title'));
			
			// Initial run.
			this.refresh();
		}, 
		
		//
		// Merges optional parameters with defaults. 
		// - Optional params will always overwrite default params.
		// - Undefined params will be added to the default params.
		//
		mergeDefaultParams: function(defaults, compare) {
			var self = this;
			
			$.each(compare, function(key, val) {
				if ($.isPlainObject(val)) {
					if (defaults.hasOwnProperty(key)) {
						self.mergeDefaultParams(defaults[key], val);
					} else {
						defaults[key] = val;
					}
				} else {
					if (defaults.hasOwnProperty(key)) {
						defaults[key] = val;
					}
				}
			});
		},
		
		//
		// Convert date String to Prototype.
		//
		dateStringToPrototype: function(str) {		
			var ts;
			
			// yyyy-mm-dd    h  h  :  m  m  :  s  s
			// 0123456789 10 11 12 13 14 15 16 17 18 19
			ts = {
				Y: parseInt(str.substring(0,4)),
				M: parseInt(str.substring(5,7)),
				D: parseInt(str.substring(8,10)),
				H: parseInt(str.substring(11,13)),
				I: parseInt(str.substring(14,16)),
				S: parseInt(str.substring(17,19)),				
			};
			
			return ts;
		},
		
		//
		// Convert date Object to Prototype.
		//
		dateObjectToPrototype: function(obj) {
			var ts;
			
			ts = {
				Y: parseInt(obj.getFullYear().toString()),
				M: (parseInt(obj.getMonth().toString()) + 1),
				D: parseInt(obj.getDate().toString()),
				H: parseInt(obj.getHours().toString()),
				I: parseInt(obj.getMinutes().toString()),
				S: parseInt(obj.getSeconds().toString()),
			};
			
			return ts;
		},
		
		//
		// Convert date Prototype to String. 
		//
		prototypeDateToString: function(ts) {
			return (ts.Y + '-' + ts.M + '-' + ts.D + ' ' + ts.H + ':' + ts.I + ':' + ts.S);
		},
		
		//
		// Convert timestamp to seconds.
		//
		stampInSeconds: function(stamp) {			
			var ts = (stamp.Y * this.params.seconds.inYear) 
				+ (stamp.M * this.params.seconds.inMonth)
				+ (stamp.D * this.params.seconds.inDay)
				+ (stamp.H * this.params.seconds.inHour)
				+ (stamp.I * this.params.seconds.inMinute)
				+ (stamp.S);			
				
			return ts;
		},
		
		//
		// Ensure number is expressed with padded 0 digits to the length of len.
		//
		paddedNumber: function(num, len) {
			return (num.length >= len) ? num : this.paddedNumber('0' + num, len);
		},
		
		//
		// Formats a string by the number of specified arguments.
		//
		stringFormat: function() {
			var str = arguments[0];
			var argc = arguments.length;
			
			$.each(arguments, function(key, argument) {
				if (key == 0) { return true; }
				str=str.replace('{' + (key-1) + '}', argument);
			});
			
			return str;
		},
		
		//
		// Formats a date according to specified format.
		// (TimeStamp must be an instance of prototype).
		//
		dateFormat: function(ts, format) {
			tokens = {
				'{Y}': ts.Y, // Year.
				'{M}': this.paddedNumber(ts.M.toString(), 2), // Month.
				'{D}': this.paddedNumber(ts.D.toString(), 2), // Day.
				'{H}': this.paddedNumber(ts.H.toString(), 2), // Hour.
				'{I}': this.paddedNumber(ts.I.toString(), 2), // Minute.
				'{S}': this.paddedNumber(ts.S.toString(), 2), // Second.
				// =================
				'{DA}': Math.round(ts.DA), // Days ago.
				'{HA}': Math.round(ts.HA), // Hours ago.
				'{IA}': Math.round(ts.IA) // Minutes ago.				
			};
			
			formatArgs = Array('');
			str = '';
						
			// for each of the tags found, add them in order to a
			// param list, and substitute the tag for the key of
			// the param then pass the array to the string format.
			$.each(format.split(/(\{[A-Z]{1,2}\})/), function(key, val) {
				
				if (tokens.hasOwnProperty(val))
				{
					str += '{' + (formatArgs.length - 1) +'}';
					formatArgs[formatArgs.length] = tokens[val];
				} else {
					str += val;
				}
			});
			
			formatArgs[0] = str;

			return this.stringFormat.apply(this, formatArgs);
		},
		
		//
		// Gets the new time message and sets the text value
		// of the element to the new timestamp message.
		//
		refresh: function() {
			var n = new Date();
			this.now = this.dateObjectToPrototype(n);
			
			var tisNow = this.stampInSeconds(this.now);
			var tisTs = this.stampInSeconds(this.ts);			
			
			var diff = (tisNow - tisTs);
			
			this.ts.DA = (diff / this.params.seconds.inDay);
			this.ts.HA = (diff / this.params.seconds.inHour);
			this.ts.IA = (diff / this.params.seconds.inMinute);
			
			var self = this;
			message = function() {
				// mins_1 and mins_x
				if (diff < self.params.seconds.inMinute)
				{
					return self.params.message.just_now;
				}
				// hour_1 and hour_x
				if (diff < self.params.seconds.inHour)
				{
					if (diff < (self.params.seconds.inMinute * 2))
					{
						return self.dateFormat(self.ts, self.params.message.min_1);
					} else {
						return self.dateFormat(self.ts, self.params.message.min_x);
					}
				}
				// day_1 and day_x
				if (diff < self.params.seconds.inDay)
				{
					if (diff < (self.params.seconds.inHour * 2))
					{
						return self.dateFormat(self.ts, self.params.message.hour_1);
					} else {
						return self.dateFormat(self.ts, self.params.message.hour_x);
					}
				}
				if (diff < self.params.seconds.inWeek)
				{
					if (diff < (self.params.seconds.inDay * 2))
					{
						return self.dateFormat(self.ts, self.params.message.day_1);
					} else {
						return self.dateFormat(self.ts, self.params.message.day_x);
					}
				}
				//if (diff < this.params.seconds.inMonth)
				//{
				//	return this.timestamp.toDateString();
				//}
				
				return self.prototypeDateToString(self.ts);
			};
			
			$(this.element).text(message());
		},
		
	};

	
}(window.jQuery);

//-->
