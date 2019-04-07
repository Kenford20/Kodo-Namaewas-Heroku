const nameHandlers = require('../player-setup/name-handlers');
const SEND_NAME_TO_SERVER = nameHandlers.sendNameToServer;

function styleTeamChatBox(teamColor) {
    const teamChatBox = document.querySelector("#team-chat-div");
    teamChatBox.classList.remove("chat-black", "team-chat-red", "team-chat-blue");
    teamChatBox.classList.add(teamColor)
}

function handleJoinTeam(socket, gameisNotStarted, teamColor, clientData) {
    const { name, team, isSpymaster } = clientData;

    if(gameisNotStarted && name != '' && team != teamColor){
        let socketMessage = teamColor === 'blue' ? 'playerJoinedBlue' : 'playerJoinedRed';
        let CSS_class = teamColor === 'blue' ? 'team-chat-blue' : 'team-chat-red';

        SEND_NAME_TO_SERVER(socket, socketMessage, name);
        styleTeamChatBox(CSS_class);
        clientData.team = teamColor;
        clientData.isOnATeam = true;
        clientData.teamJoinCounter++;

		if(isSpymaster == true) {
            clientData.isSpymaster = false;
            if(teamColor === 'blue') {
                socket.emit('redSpyChangedTeam');
            } else if(teamColor === 'red') {
                socket.emit('blueSpyChangedTeam');
            }
		}
        console.log(clientData);
    } 
}

module.exports = {
    handleJoinTeam: handleJoinTeam,
    styleTeamChatBox: styleTeamChatBox
}