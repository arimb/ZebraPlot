const events = {
	'Midwest Regional': '2020ilch',
	'SBPLI 1': '2020nyli1',
	'SBPLI 2': '2020nyli2',
	'South Florida Regional': '2020flwp',
	'FIT Greenville': '2020txgre',
	'FIT Plano': '2020txpla',
	'FIT Fort Worth': '2020txfor',
	'FIT Dallas': '2020txdls',
	'PNW Clackamas Academy': '2020orore',
	'PNW Glacier Peak': '2020wasno',
	'PNW West Valley': '2020waspo',
	'PNW Auburn Mountainview': '2020waamv',
	'PNW Wilsonville': '2020orwil',
	'PNW SunDome': '2020wayak',
	'PNW Bellingham': '2020wabel',
	'PNW Oregon State Fairgrounds': '2020orsal',
	'PNW Auburn': '2020waahs',
	'PNW District Championship': '2020pncmp',
	'FNC Wake County': '2020ncwak',
	'FNC UNC Pembroke': '2020ncpem',
	'FNC ECU': '2020ncgre',
	'FNC Guilford': '2020ncgui',
	'FNC Asheville': '2020ncash',
	'FNC District Championship': '2020nccmp',
	'IN Bloomington': '2020inblo',
	'IN St. Joseph': '2020inmis',
	'IN Columbus': '2020incol',
	'IN Perry Meridian': '2020inpmh',
	'IN District Championship': '2020incmp'
};

$(document).ready(function(){
	$('button#menu').click(function(){
	console.log('hit');
	$('div#menu').show();
	});
	$('span.close').click(function(){
		$('div#menu').hide();
	});
	$(window).click(function(event){
		if(event.target == $('div#menu')[0])
			$('div#menu').hide();
	});
	Object.keys(events).forEach(function(name){$('select#event')[0].append(new Option(name, events[name]))});

	$('button#go').click(function(){
		$('div#menu').hide();
		
	});
});