# Kodo Namaewas: a multiplayer, online version of Codenames, with a Japanese mix.

Play this table-top card game across multiple devices with your friends on a shared board!
Just open a browser and type in the URL(www.weebcodenames.online) while your friends are connected.

* 

## Objective: The goal of the game is for the guessers of each team to correctly guess all of their team's cards before the other team.

### *Getting Started (need atleast 4 players - a spymaster and a guesser for each team):*

* Enter your game ID and join a team (Ao chimu = blue team and Aka chimu = red team)
* Click the `supaimasuta` button to become your team's spymaster (aka the player giving the hints)
* Once four or more players are connected, click the `Gemu o Hajimeru` button to start a match
* When a match has starts, a set of 25 randomly generated words will appear on the 5x5 board of cards
* The board consists of 17 team color cards (red/blue, starting team has 9, other has 8), 7 neutral cards (yellow) and 1 assassin card (black)
*insert img of 5x5 board

### *Game Rules:*
* A random team will be chosen to start
* Each round consists of a hinting phase and a guessing phase, where the rounds will alternate between teams
  * **HINT PHASE**: spymaster will provide a ONE-WORD hint in the text box along with a number for his/her guessing teammates (keep in mind that your teammates cannot see what color the cards are)
    1. The hint should not contain any words or any part of the words that are currently on the board 
    2. The hint should be chosen such that it relates to as many words as possible (that are your team's color)
    3. Select the number of words that your hint relates to using the dropdown menu (this is a maximum number, your teammates can choose to voluntarily end the guessing phase) This means you can take risks in the number you chose if your word hint is not clearly related to all the words you had in mind
    4. Be sure to double check that your hint is not potentially related to the opposing team's cards  (or worse, the assassin card)
    
  * **GUESS PHASE**: Once the spymaster has given the hint, the guessers of the corresponding team will be shown the hint, along with the number of words they are to guess that relate to the hint. They must select 
    1. The guessers just simply have to click the appropriate card once they have decided which words to select
    2. Once a card is selected, its color will be revealed to all players
    3. If the card is the assassin card, the team that selected it loses!
    4. If the card is a neutral card, that team's turn is ended (even if there are more remaining cards that can be selecting that turn)
    5. If the card is your team's color, you are able to select another card (if your number of guesses is more than 1 of course) Otherwise, your turn ends because you chose your enemy team's card, which helps them get closer to winning! :( So take your time with your guesses! Also, you can collaborate with your guessing teammates and discuss which words you have in mind to be selected
    *insert img of chatboxes
* For a more official overview of the rules, visit [here!](https://en.wikipedia.org/wiki/Codenames_(board_game))
    
### *How to Win*
The winner is the first team to have all their team's color cards selected by the guessers. Since this is a turn based game, spymasters, choose your hints wisely so that your guessers can have a better opportunity to win faster! The game also ends if the assassin card(black) is chosen, the team that selected it loses of course(so remember to avoid any hints that may relate to it in anyway, spymasters)!

### Mobile Responsive - Grab your phones and play with your friends now!


### Technologies used
* A Node server runs in the back end with the help of Express.js library to easily set up a web server
* Node pairs with Socket.io, a JavaScript library for real-time web applications, to handle server-side communication with connected clients
* HTML and CSS for the front end view
* Vanilla JavaScript to handle client side DOM events 

### License
MIT © [Kenny Zhou](https://github.com/kenford20)

    
    
    
    

