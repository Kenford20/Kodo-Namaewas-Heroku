const blueScoreValue = document.querySelector("#blue-score-number");
const redScoreValue  = document.querySelector("#red-score-number");

function updateScores({ numBlueCards, numRedCards }){
	blueScoreValue.innerHTML = numBlueCards;
	redScoreValue.innerHTML = numRedCards;
}

module.exports = {
    updateScores: updateScores
}
