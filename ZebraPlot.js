const events = {
	'Chezy Champs': '2019cc',
	'Midwest Regional': '2020ilch',
	'SBPLI 1': '2020nyli',
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
const tba_api = 'https://www.thebluealliance.com/api/v3';
const tba_params = 'accept=application/json&X-TBA-Auth-Key=8RP1cDp90o0ODMRwz9uSWYCMINv1qDZacjaZwQJ0NSCaWnyyK2UtS7uc2WGKmzla';

$(document).ready(function(){
	$('button#menu').click(function(){
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

	var width = $('img').width();
	var height = $('img').height();

	var heatmapInstance = h337.create({container: $('div#canvas-wrapper')[0], radius:1/54*(width*0.914), opacity:0.5, blur:0.6});
	$('button#go').click(function(){
		$('div#menu').hide();

		var request = new XMLHttpRequest();
		request.open('GET', tba_api + '/team/frc' + $('input#team')[0].value + 
			'/event/' + $('select#event').children('option:selected')[0].value + '/matches/keys?' + tba_params);
		request.onload = function(){
			var matches = JSON.parse(this.response);
			const promises = matches.map(match => new Promise(resolve => 
				resolve($.getJSON(tba_api + '/match/' + match + '/zebra_motionworks', tba_params))));
			Promise.all(promises).then(results => {
				var data = [];
				results.forEach(match_data => {
					['blue', 'red'].forEach(alliance => {
						match_data['alliances'][alliance].forEach(team => {
							if (team['team_key'] == 'frc'+$('input#team')[0].value){
								team['xs'].forEach(function(a, i){
									data.push({
										x: Math.round((alliance=='red'?a/54:(1-a/54))*(width*0.914)+(width*0.0422)), 
										y: Math.round((height*0.95)-(alliance=='red'?team['ys'][i]/27:(1-team['ys'][i]/27))*(height*0.901)), 
										value: 1
									});
									// console.log(a);
									// heatmapInstance.addData({x: (alliance=='blue'?(a*1000/54):(1000/54*(1-a))), y: team['ys'][i]*400/27, value: 1});
								});
							}
						});
					});
				});
				console.log(data);
				heatmapInstance.setData({
					max: data.length/500,
					data: data
				});
			});
		};
		request.onerror = function(err){console.log(err);};
		request.send();
	});
});