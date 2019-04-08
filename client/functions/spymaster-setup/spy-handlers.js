const hideShowHandlers = require('../hide-show-handlers');
let HIDE_ELEMENTS = hideShowHandlers.hideElements;
let SHOW_ELEMENTS = hideShowHandlers.showElements;

function sendSpyToServer(socket, client) {
    let socketMessage = client.team === 'blue' ? 'blueSpySelected' : 'redSpySelected';
    client.isSpymaster = true;
    socket.emit(socketMessage, client.name);
}

function highlightSpymaster(nameOfSpy, playerList, teamColor) {
    let borderColor = teamColor === 'blue' ? '2px solid lightblue' : '2px solid pink';

    [].slice.call(playerList.querySelectorAll("h3")).map(player => {
        if(player.innerHTML === nameOfSpy) {
            player.style.background = "grey";
			player.style.border = borderColor;
			player.style.padding = "5px";
        }
    });
}

function removeSpyButton(socket, spymasterName, spyExists, spyTeamColor) {
	if(spyExists){
        let spyNameID = spyTeamColor === 'blue' ? '#blue-spy-name' : '#red-spy-name';
        let socketMessage = spyTeamColor === 'blue' ? 'highlightBlueSpy' : 'highlightRedSpy';
        document.querySelector(spyNameID).innerHTML = spymasterName;
        
        HIDE_ELEMENTS(
            spyTeamColor === 'blue' 
                ? document.querySelector("#blue-spy")
                : document.querySelector("#red-spy"),
            spyTeamColor === 'blue'
                ? document.querySelector("#blue-spy-waiting")
                : document.querySelector("#red-spy-waiting")
        );
        SHOW_ELEMENTS(
            spyTeamColor === 'blue' 
                ? document.querySelector("#reveal-blue-spy") 
                : document.querySelector("#reveal-red-spy")
        );
        socket.emit(socketMessage, spymasterName);
    }
}

function showSpyButton(client, spyTeamColor) {
    client.isSpymaster = false;
    
    SHOW_ELEMENTS(
        spyTeamColor === 'blue' 
            ? document.querySelector("#blue-spy")
            : document.querySelector("#red-spy"),
        spyTeamColor === 'blue'
            ? document.querySelector("#blue-spy-waiting")
            : document.querySelector("#red-spy-waiting")
    );
    HIDE_ELEMENTS(
        spyTeamColor === 'blue' 
            ? document.querySelector("#reveal-blue-spy") 
            : document.querySelector("#reveal-red-spy")
    );
}

module.exports = {
    sendSpyToServer: sendSpyToServer,
    highlightSpymaster, highlightSpymaster,
    removeSpyButton: removeSpyButton,
    showSpyButton: showSpyButton
}
