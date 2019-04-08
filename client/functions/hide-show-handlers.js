function hideElements(...elements){
	elements.map(element => {
		if(element)
			element.classList.add("hide");
	});
}

function showElements(...elements){
	elements.map(element => {
		if(element)
			element.classList.remove("hide");
	});
}

module.exports = {
    hideElements: hideElements,
    showElements: showElements
}