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
const colors = ['#0072BD', '#D95319', '#EDB120', '#7E2F8E', '#77AC30', '#4DBEEE', '#A2142F']

$(document).ready(function(){
	$('button#menu').click(function(){
		$('div#modal').show();
	});
	$('span.close').click(function(){
		$('div#modal').hide();
	});
	$(window).click(function(event){
		if(event.target == $('div#modal')[0])
			$('div#modal').hide();
	});
	$('input#team').keypress(function(e){
		if(e.keyCode==13) $('button#go').click();
    });
	
	Object.keys(events).forEach(function(name){$('select#event')[0].append(new Option(name, events[name]))});

	var width = $('img').width();
	var height = $('img').height();

	$('button#go').click(function(){
		$('div#modal').hide();
		$('span#loading').show();
		$('canvas').remove();

		switch ($('.tablinks.active')[0].id) {
			case 'Heatmap':
				var request = new XMLHttpRequest();
				request.open('GET', tba_api + '/team/frc' + $('input#team')[0].value + 
					'/event/' + $('select#event').children('option:selected')[0].value + '/matches/keys?' + tba_params);
				request.onload = function(){
					var matches = JSON.parse(this.response);
					const promises = matches.map(match => new Promise(resolve => 
						resolve($.getJSON(tba_api + '/match/' + match + '/zebra_motionworks', tba_params))));
					Promise.all(promises).then(results => {
						var data = [];
						var heatmapInstance = h337.create({container: $('div#canvas-wrapper')[0], radius:1/54*(width*0.914), opacity:0.5, blur:0.6});
						results.forEach(match_data => {
							['blue', 'red'].forEach(alliance => {
								match_data['alliances'][alliance].forEach(team => {
									if (team['team_key'] == 'frc'+$('input#team')[0].value){
										team['xs'].forEach(function(a, i){
											data.push({
												x: transformX(a, alliance, width), 
												y: transformY(team['ys'][i], alliance, height), 
												value: 1
											});
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
						$('span#loading').hide();
					});
				};
				request.onerror = function(err){console.log(err);};
				request.send();
			break;
			case 'AutoPath':
				$('div#canvas-wrapper').append('<canvas id="autopaths" width="'+width+'" height="'+height+'" style="position:absolute; left: 0px; top: 0px; width: 100%; height: 100%;"></canvas>')
				var ctx = $('canvas')[0].getContext('2d');
				ctx.lineWidth = "2";
				
				var request = new XMLHttpRequest();
				request.open('GET', tba_api + '/team/frc' + $('input#team')[0].value + 
					'/event/' + $('select#event').children('option:selected')[0].value + '/matches/keys?' + tba_params);
				request.onload = function(){
					var matches = JSON.parse(this.response);
					const promises = matches.map(match => new Promise(resolve => 
						resolve($.getJSON(tba_api + '/match/' + match + '/zebra_motionworks', tba_params))));
					Promise.all(promises).then(results => {
						results.forEach(function(match_data, i){
							['blue', 'red'].forEach(alliance => {
								match_data['alliances'][alliance].forEach(team => {
									if (team['team_key'] == 'frc'+$('input#team')[0].value){
										ctx.strokeStyle = colors[i%7];
										ctx.beginPath();
										ctx.moveTo(transformX(team['xs'][0], alliance, width), transformY(team['ys'][0], alliance, height));
										team['xs'].slice(1, 160).forEach(function(a, i){
											if((team['xs'][i]-a)*(team['xs'][i]-a) + (team['ys'][i]-team['ys'][i+1])*(team['ys'][i]-team['ys'][i+1]) > 25){
												ctx.moveTo(transformX(a, alliance, width), transformY(team['ys'][i+1], alliance, height));
											}else{
												ctx.lineTo(transformX(a, alliance, width), transformY(team['ys'][i+1], alliance, height));
											}
										});
										ctx.stroke();
									}
								});
							});
						});
						$('span#loading').hide();
					});				};
				request.onerror = function(err){console.log(err);};
				request.send();
			break;
		}
	});
});

function openTab(evt, tabName){
	console.log(tabName);
	$('.tablinks').removeClass('active');
	$('.tablinks#'+tabName).addClass('active');
}

function transformX(a, alliance, width){
	return Math.round((alliance=='red'?a/54:(1-a/54))*(width*0.914)+(width*0.0422))
}

function transformY(a, alliance, height){
	return Math.round((height*0.95)-(alliance=='red'?a/27:(1-a/27))*(height*0.901))
}