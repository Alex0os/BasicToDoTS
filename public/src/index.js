const divs = document.getElementsByClassName('task');

for (let div of divs) {
	div.addEventListener('click', function() {
		uuid = div.getAttribute("data-uuid");
		window.location.href = "task/" + uuid;
	});
}
