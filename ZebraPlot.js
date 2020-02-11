$(document).ready(function(){
	// MODAL
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
});



// var modal = document.getElementById("myModal");
// var btn = document.getElementById("myBtn");
// var span = document.getElementsByClassName("close")[0];

// btn.onclick = function() {
//   modal.style.display = "block";
// }
// span.onclick = function() {
//   modal.style.display = "none";
// }
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }