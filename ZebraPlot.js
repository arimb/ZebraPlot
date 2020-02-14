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
const colors2 = {'red': ['#fa202f', '#fc6a74', '#ff6017'], 'blue': ['#202bfa', '#6a71fc', '#17b2ff']};

var animation_time = 0;
var animation_data;
var animation_speed;

var width;
var height;

$(document).ready(function(){
	$(window).resize(function(){
		width = $('img').width();
		height = $('img').height();
	})
	$(window).resize();

	$('button.menu').click(function(){
		$('div#modal').show();
	});
	$('span#close').click(function(){
		$('div#modal').hide();
	});
	$(window).click(function(event){
		if(event.target == $('div#modal')[0])
			$('div#modal').hide();
	});
	$('select#team').keypress(function(e){
		if(e.keyCode==13) $('button#go').click();
    });
	
	Object.keys(events).forEach(function(name){$('select#event')[0].append(new Option(name, events[name]))});

	$('select#event').change(function(){
		var request = new XMLHttpRequest();
		request.open('GET', tba_api + '/event/' + $('select#event').children('option:selected')[0].value + '/teams/keys?' + tba_params);
		request.onload = function(){
			$('select#team').empty();
			JSON.parse(this.response).sort(function(a,b){return parseInt(a.substring(3))-parseInt(b.substring(3))}).forEach(team => {
				$('select#team').append('<option value="' + team + '">' + team.substring(3) + '</option>');
			});
		}
		request.onerror = function(err){console.log(err);};
		request.send();

		var request2 = new XMLHttpRequest();
		request2.open('GET', tba_api + '/event/' + $('select#event').children('option:selected')[0].value + '/matches/simple?' + tba_params);
		request2.onload = function(){
			$('select#match').empty();
			JSON.parse(this.response).sort(function(a,b){return a['time']-b['time']}).forEach(match => {
				$('select#match').append('<option value="' + match['key'] + '">' + match['key'].substring(match['key'].indexOf('_')+1) + '</option>');
			});
		}
		request2.onerror = function(err){console.log(err);};
		request2.send();
	});
	$('select#event').change();

	

	$('button#go').click(function(){
		$('div#modal').hide();
		$('span.loading').show();
		$('canvas').remove();

		switch ($('.tablinks.active')[0].id) {
			case 'Heatmap':
				$('div#control').hide();
				$('fieldset').hide();
				var request = new XMLHttpRequest();
				request.open('GET', tba_api + '/team/' + $('select#team').children('option:selected')[0].value + 
					'/event/' + $('select#event').children('option:selected')[0].value + '/matches/keys?' + tba_params);
				request.onload = function(){
					var matches = JSON.parse(this.response);
					const promises = matches.map(match => new Promise(resolve => 
						resolve($.getJSON(tba_api + '/match/' + match + '/zebra_motionworks', tba_params))));
					Promise.all(promises).then(results => {
						var data = [];
						var heatmapInstance = h337.create({container: $('div#content-wrapper')[0], radius:1/54*(width*0.914), opacity:0.5, blur:0.6});
						results.forEach(match_data => {
							['blue', 'red'].forEach(alliance => {
								match_data['alliances'][alliance].forEach(team => {
									if (team['team_key'] == $('select#team').children('option:selected')[0].value){
										team['xs'].forEach(function(a, i){
											data.push({
												x: transformX(a, alliance=='red', width), 
												y: transformY(team['ys'][i], alliance=='red', height), 
												value: 1
											});
										});
									}
								});
							});
						});
						heatmapInstance.setData({
							max: data.length/500,
							data: data
						});
						$('span.loading').hide();
					});
				};
				request.onerror = function(err){console.log(err);};
				request.send();
			break;
			case 'AutoPath':
				$('div#control').hide();
				$('fieldset').hide();
				$('div#content-wrapper').append('<canvas id="autopaths" width="'+width+'" height="'+height+'" style="position:absolute; left: 0px; top: 0px;"></canvas>')
				var ctx = $('canvas')[0].getContext('2d');
				ctx.lineWidth = "2";
				
				var request = new XMLHttpRequest();
				request.open('GET', tba_api + '/team/' + $('select#team').children('option:selected')[0].value + 
					'/event/' + $('select#event').children('option:selected')[0].value + '/matches/keys?' + tba_params);
				request.onload = function(){
					var matches = JSON.parse(this.response);
					const promises = matches.map(match => new Promise(resolve => 
						resolve($.getJSON(tba_api + '/match/' + match + '/zebra_motionworks', tba_params))));
					Promise.all(promises).then(results => {
						results.forEach(function(match_data, i){
							['blue', 'red'].forEach(alliance => {
								match_data['alliances'][alliance].forEach(team => {
									if (team['team_key'] == $('select#team').children('option:selected')[0].value){
										ctx.strokeStyle = colors[i%7];
										ctx.beginPath();
										ctx.moveTo(transformX(team['xs'][0], alliance=='red', width), transformY(team['ys'][0], alliance=='red', height));
										team['xs'].slice(1, 160).forEach(function(a, i){
											if((team['xs'][i]-a)*(team['xs'][i]-a) + (team['ys'][i]-team['ys'][i+1])*(team['ys'][i]-team['ys'][i+1]) > 25){
												ctx.moveTo(transformX(a, alliance=='red', width), transformY(team['ys'][i+1], alliance=='red', height));
											}else{
												ctx.lineTo(transformX(a, alliance=='red', width), transformY(team['ys'][i+1], alliance=='red', height));
											}
										});
										ctx.stroke();
									}
								});
							});
						});
						$('span.loading').hide();
					});
				};
				request.onerror = function(err){console.log(err);};
				request.send();
			break;
			case 'Playback':
				$('div#control').css('display', 'flex');
				$('fieldset').show();
				$('div#content-wrapper').append('<canvas id="playback" width="'+width+'" height="'+height+'" style="position:absolute; left: 0px; top: 0px;"></canvas>')
				var request = new XMLHttpRequest();
				request.open('GET', tba_api + '/match/' + $('select#match').children('option:selected')[0].value + '/zebra_motionworks?' + tba_params);
				request.onload = function(){
					animation_time = 0;
					animation_data = JSON.parse(this.response);
					['red', 'blue'].forEach(alliance => {
						animation_data['alliances'][alliance].forEach(function(team, i){
							$('div.key-box#'+alliance+(i+1)+' > span.team-key').html(team['team_key'].substring(3));
						});
					});
					console.log(animation_data)
					$('span#time-current').html('00:00');
					$('span#time-length').html(String(Math.floor(animation_data['times'].length/600)).padStart(2, '0') + ':' + String(Math.floor((animation_data['times'].length/10)%60)).padStart(2, '0'));
					$('input#time-slider').attr('max', animation_data['times'].length);
					$('span.loading').hide();
					drawFrame();
				}
				request.onerror = function(err){console.log(err);};
				request.send();
			break;
		}
	});

	$('i#back').click(function(){
		$('i#play').show();
		$('i#pause').hide();
		animation_time = 0;
		animation_speed = 0;
		drawFrame();
	});
	$('i#play').click(function(){
		$('i#play').hide();
		$('i#pause').show();
		animation_speed = 1;
		animate();
	});
	$('i#pause').click(function(){
		$('i#play').show();
		$('i#pause').hide();
		animation_speed = 0;
	});
	$('i#fastforward').click(function(){
		$('i#play').hide();
		$('i#pause').show();
		animation_speed = 2.5;
		animate();
	});
	$('input#time-slider').on('input', function(){
		animation_time = parseInt($('input#time-slider').val());
		drawFrame();
	});
	$(window).keypress(function(event){
		if(event.keyCode==32){
			if($('i#play').is(':visible'))
				$('i#play').click();
			else if($('i#pause').is(':visible'))
				$('i#pause').click();
		}
		if(event.keyCode==13 && $('div#modal').is(':visible'))
			$('button#go').click();
	});
	$(window).keydown(function(event){
		if($('div#control').is(':visible') && event.keyCode==37 && animation_time>0){
			animation_time--;
			drawFrame();
		}
		if($('div#control').is(':visible') && event.keyCode==39 &&animation_time<animation_data['times'].length){
			animation_time++;
			drawFrame();
		}
		if(event.key=='Escape')
			$('div#modal').hide();
	});
});

function openTab(evt, tabName){
	$('.tablinks').removeClass('active');
	$('.tablinks#'+tabName).addClass('active');
	if(tabName == 'Playback'){
		$('div#team').hide();
		$('div#match').css('display', 'flex');
	}else{
		$('div#team').css('display', 'flex');
		$('div#match').hide();
	}
}

function transformX(a, flip, width){
	if(a == null)
		return null
	return Math.round((flip?a/54:(1-a/54))*(width*0.914)+(width*0.0422))
}

function transformY(a, flip, height){
	if(a == null)
		return null
	return Math.round((height*0.95)-(flip?a/27:(1-a/27))*(height*0.901))
}

function animate(){
	setTimeout(function(){
		if(animation_time>=animation_data['times'].length)
			$('i#pause').click();
		if(animation_speed)
			window.requestAnimationFrame(animate);
		animation_time++;
		drawFrame();
	}, 100/animation_speed);
	
}

function drawFrame(){
	var ctx = $('canvas')[0].getContext('2d');
	ctx.globalCompositeOperation = 'destination-over';
	ctx.clearRect(0, 0, width, height); // clear canvas
	ctx.lineWidth = '2';

	['red', 'blue'].forEach(alliance => {
		animation_data['alliances'][alliance].forEach(function(team, i){
			ctx.strokeStyle = colors2[alliance][i];
			ctx.fillStyle = colors2[alliance][i];
			ctx.beginPath();
			if(team['xs'][animation_time]!=null && team['ys'][animation_time]!=null)
				ctx.moveTo(transformX(team['xs'][animation_time], false, width), transformY(team['ys'][animation_time], false, height));
			for (var j=1; j<10; j++) {
				if(j>animation_time) break;
				if(team['xs'][animation_time-j]!=null && team['ys'][animation_time-j]!=null)
					ctx.lineTo(transformX(team['xs'][animation_time-j], false, width), transformY(team['ys'][animation_time-j], false, height));
			}
			ctx.stroke();
			if(team['xs'][animation_time]!=null && team['ys'][animation_time]!=null){
				ctx.beginPath();
				ctx.arc(transformX(team['xs'][animation_time], false, width), transformY(team['ys'][animation_time], false, height), 5, 0, 2*Math.PI);
				ctx.fill();
			}
		});
	});

	$('span#time-current').html(String(Math.floor(animation_time/600)).padStart(2, '0') + ':' + String(Math.floor((animation_time/10)%60)).padStart(2, '0'));
	$('input#time-slider').val(animation_time);
}