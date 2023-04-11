# Kodo Namaewas: a multiplayer, online version of Codenames, with a Japanese mix.

Play this table-top card game across multiple devices with your friends on a shared board!
Just open a browser and type in the URL(https://kodo-namaewaz.web.app/) while your friends are connected.

##### *Screenshot of app upon entering the website*
![codenames2](https://user-images.githubusercontent.com/41027303/52194222-f706e700-2820-11e9-9886-44a23886c41e.png)

## Objective: The goal of the game is for the guessers of each team to correctly guess all of their team's cards before the other team.

### *Getting Started (need atleast 4 players - a spymaster and a guesser for each team):*

* Enter your game ID and join a team (Ao chimu = blue team and Aka chimu = red team)
* Click the `supaimasuta` button to become your team's spymaster (aka the player giving the hints)
* Once four or more players are connected, click the `Gemu o Hajimeru` button to start a match
* When a match has starts, a set of 25 randomly generated words will appear on the 5x5 board of cards
* The board consists of 17 team color cards (red/blue, starting team has 9, other has 8), 7 neutral cards (yellow) and 1 assassin card (black)
##### *Screenshot of the board from the red spymaster's point of view during the red team's turn (cards will appear all grey for guessing players)*

![codenames-board](https://user-images.githubusercontent.com/41027303/52196543-3980f180-282a-11e9-8b02-1e00393f9640.png)

### *Game Rules:*
* A random team will be chosen to start
* Each round consists of a hinting phase and a guessing phase, where the rounds will alternate between teams
  * **HINT PHASE**: spymaster will provide a ONE-WORD hint in the text box along with a number for his/her guessing teammates (keep in mind that your teammates cannot see what color the cards are)
    * The hint should not contain any words or any part of the words that are currently on the board 
    * The hint should not relate to the spelling or letter arrangement of the word 
    * The hint should be chosen such that it relates to as many words as possible (that are your team's color), like relating its meaning to other words or anything else you can think of! Be creative. Ex: for apple and orange, a hint could be fruit, 2
    * Select the number of words that your hint relates to using the dropdown menu (this is a maximum number, your teammates can choose to voluntarily end the guessing phase) This means you can take risks in the number you chose if your word hint is not clearly related to all the words you had in mind
    * Be sure to double check that your hint is not potentially related to the opposing team's cards  (or worse, the assassin card)
    * Note: The rules for hints above are just general base-lines. You and your friends can discuss what is acceptable or not, but try to be reasonable :)
    
  * **GUESS PHASE**: Once the spymaster has given the hint, the guessers of the corresponding team will be shown the hint, along with the number of words they are to guess that relate to the hint. They must select 
    * The guessers just simply have to click the appropriate card once they have decided which words to select
    * Once a card is selected, its color will be revealed to all players
    * If the card is the `assassin card`, the team that selected it loses!
    * If the card is a `neutral card`, that team's turn is ended (even if there are more remaining cards that can be selecting that turn)
    * If the card is your `team's color`, you are able to select another card (if your number of guesses is more than 1 of course) Otherwise, your turn ends because you chose your `enemy team's` card, which helps them get closer to winning! :( So take your time with your guesses! Also, you can collaborate with your guessing teammates and discuss which words you have in mind to be selected using the *chat feature* of the game shown below
    ##### *Screenshot of the chatboxes and their features*
    ![codenames-chat](https://user-images.githubusercontent.com/41027303/52196359-9039fb80-2829-11e9-8928-1f8ba9545930.png)

* For a more official overview of the rules, visit [here!](http://www.boardgamecapital.com/game_rules/codenames.pdf)
    
### *How to Win*
The winner is the first team to have all their team's color cards selected by the guessers. Since this is a turn based game, spymasters, choose your hints wisely so that your guessers can have a better opportunity to win faster! The game also ends if the assassin card(black) is chosen, the team that selected it loses of course(so remember to avoid any hints that may relate to it in anyway, spymasters)!

### *Mobile Responsive - Grab your phones and play with your friends now!*
![codenames-mobile](https://user-images.githubusercontent.com/41027303/52195045-37b42f80-2824-11e9-8c8c-ec2b4568144c.png) 

### *Technologies used:*
* A Node server runs in the back end with the help of Express.js library to easily set up a web server
* Node pairs with Socket.io, a JavaScript library for real-time web applications, to handle server-side communication with connected clients
* HTML and CSS for the front end view
* Vanilla JavaScript to handle client side DOM events 

### *License:*
MIT © [Kenny Zhou](https://github.com/kenford20)

    
    
    
    

