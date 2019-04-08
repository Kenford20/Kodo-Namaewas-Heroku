const chat           = document.querySelector("#chat");
const chatInput      = document.querySelector("#chat-input");
const teamChatInput  = document.querySelector("#team-chat-input");
const chatBox        = document.querySelector("#global-message-box");
const teamChatBox    = document.querySelector("#team-message-box");

function chatEntered(socket, client) {
    
	if(event.keyCode == 13) {
		const { name } = client;
		if(name != '') {
			const chatData = {
				chatter: '',
				chatMessage: ''
            };
            
			chatData.chatter = name;
			chatData.chatMessage = chatInput.value;
			socket.emit('someoneChatted', chatData);
			chatInput.value = '';
		} else {
			chatInput.value = '';
			alert("Please enter a name before you chat!");
		}
	}
}

function teamChatEntered(socket, client) {
	if(event.keyCode == 13) {
		const { team, name } = client;
		if(team != '') {
			const teamChatData = {
				teamChatter: '',
				chatterTeamColor: '',
				teamChatMessage: ''
            };
            
			teamChatData.teamChatter = name;
			teamChatData.chatterTeamColor = team;
			teamChatData.teamChatMessage = teamChatInput.value;
			socket.emit('teamChat', teamChatData);
			teamChatInput.value = '';
		}
		else{
			teamChatInput.value = '';
			alert("Please join a team before using team chat!");
		}
	}
}

function displayChatMessage(socket, chatter, chatMessage, isTeamMessage) {
	socket.emit('chatterSpan');

	let message = document.createElement("h5");
	let chatterName = document.createElement("span");
	let chatterNode = document.createTextNode(chatter);
	chatterName.appendChild(chatterNode);
	message.appendChild(chatterName);

	let chatText = ": " + chatMessage;
	let messageNode = document.createTextNode(chatText);
	message.appendChild(messageNode);
	message.classList.add("chat-message");

	if(isTeamMessage) {
		teamChatBox.appendChild(message);
    } else {
        chatBox.appendChild(message);
    }

	// keeps the chatbox at the bottom of the scrollbar after overflow occurs within the chatbox div
	chatBox.scrollTop = chatBox.scrollHeight;
	teamChatBox.scrollTop = teamChatBox.scrollHeight;
}

// styles the client's name in the chatbox to differentiate from the other players chat message
function highlightChatter(client) {
	let chatterNames = [].slice.call(chat.querySelectorAll("span"));
	
	chatterNames.filter(names => names.innerHTML == client.name)
	.map(name => name.classList.add('highlight-chatter'));
}

module.exports = {
    chatEntered: chatEntered,
    teamChatEntered: teamChatEntered,
    displayChatMessage: displayChatMessage,
    highlightChatter: highlightChatter
}