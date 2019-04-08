// takes an array of the board's card positions and shuffles the indices around
function shuffleNumbers(cardPositions) {
    let i = cardPositions.length;
    let j = 0;
    let temp;

    while (i--) {
    	// generates a random index to swap with
        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = cardPositions[i];
        cardPositions[i] = cardPositions[j];
        cardPositions[j] = temp;
    }
    return cardPositions;
}

module.exports = shuffleNumbers;