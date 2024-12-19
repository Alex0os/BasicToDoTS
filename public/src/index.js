const divs = document.getElementsByClassName('task');

for (let div of divs) {
	div.addEventListener('click', function() {
		alert("The uuid is: " + div.getAttribute("data-uuid"));

	});
}
