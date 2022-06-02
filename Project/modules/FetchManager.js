export {FetchManager};

class FetchManager {

    static StartPage(game, restart = false) {
        fetch('ajax/sessionManager.php', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            body: (restart) == true ? `restart=${restart}` : '',
        })
            .then(response => response.json())
            .then(data => {
                if (data.newSession == true) {
                    game.CreateMainMenuPage();
                } else {
                    game.CreatePlayersBar(data);
                    this.DataServerCoroutine(game);
                    if (data.myTurn == true) {
                        game.CreateMoveDivs(data.pawnsToMove)
                    }
                }
                game.CreateSynth();
            })
    }

    static AddPlayerToGame(game, nick, privateRoom = null) {
        fetch('ajax/addToGame.php', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            body: `nick=${encodeURIComponent(nick)}${(privateRoom) == null ? '' : `&private=${(privateRoom) == true ? '1' : '0'}`}`,
        })
            .then(response => response.json())
            .then(data => {
                game.CreatePlayersBar(data);
                this.DataServerCoroutine(game);
            })
    }

    static ChangePlayerStatusFetch(game, val) {
        fetch('ajax/changePlayerStatus.php', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            body: `status=${val}`,
        })
            .then(response => response.json())
            .then(data => {
                if (data.startGame == true) {
                    game.PrepareGame(JSON.parse(data.pawnData));
                } else {
                    game.gameStart = false;
                }
            })
    }

    static DataServerCoroutine(game, one = null) {
        let fetchFun = () => {
            let startTime = Date.now();
            fetch('ajax/getAllData.php', {
                method: 'POST',
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded"
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status == true) {
                        if (data.endGame == false) {
                            let endTime = Date.now();
                            let ping = (endTime - startTime) / 2
                            data.currentTime = data.currentTime + ping;
                            game.DataParser(data)
                        } else {
                            game.CreateEndGameScreen(JSON.parse(data.leaderBoard), data.myColor)
                        }
                    } else {
                        clearInterval(game.dataInterval);
                        game.Start(true);
                    }
                })
        }
        fetchFun();
        if (one == null) {
            game.dataInterval = setInterval(() => {
                fetchFun();
            }, 1000)
        }
    }

    static ThrowDiceFetch(game) {
        fetch('ajax/throwDice.php', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status == true) {
                    if (data.moveStatus == true) {
                        game.CreateMoveDivs(JSON.parse(data.pawnsToMove))
                    }
                    if(game.throwDiceAnimTimeout != null){
                        clearTimeout(game.throwDiceAnimTimeout);
                        game.throwDiceAnimTimeout = null
                    }
                    game.throwDiceButton.style.display = "none";
                    game.diceDiv.style.opacity = "0";
                    game.diceDiv.style.backgroundImage = `url('./img/dice/${data.myColor}/${data.diceValue}.png')`;
                    setTimeout(() => {
                        game.diceDiv.style.transform = "rotate(360deg)";
                        game.diceDiv.style.opacity = "1";
                    }, 50)
    
    
                    if (data.diceValue != undefined) {
                        speak(game.synth, data.diceValue, game.myVoice);
                    }
    
    
                    function speak(synth, text, myVoice) {
                        var u = new SpeechSynthesisUtterance;
                        u.text = text.toString();
                        u.voice = myVoice;
                        u.rate = 1;
                        u.pitch = 1;
                        synth.speak(u);
                    }
                }
            })
    }

    static ExecuteMoveFetch(game, id) {
        fetch('ajax/executeMove.php', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            body: `pawnID=${id}`
        })
            .then(response => response.json())
            .then(data => {
                if (data.pawnData != undefined) {
                    let pawnData = JSON.parse(data.pawnData);
                    game.CreateGameBoard(pawnData)
                }
                if (data.endGame == true) {
                    game.CreateEndGameScreen(JSON.parse(data.leaderBoard), data.myColor)
                }
            })
    }

    static GetRoomsFetch(game, list){
        fetch('ajax/getRooms.php', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                if(data.status == true){
                    let roomData = JSON.parse(data.rooms);
                    game.FillRoomList(roomData, list);
                } else {
                    list.innerHTML = '';
                }
            })
    }

    static JoinRoomByInviteFetch(game, nick, inviteCode) {
        fetch('ajax/joinRoomByInvite.php',{
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            body: `nick=${nick}&inviteCode=${inviteCode}`
        })
            .then(response => response.json())
            .then(data => {
                if(data.status == false){
                    game.Start(true);
                    alert("CONNECTION FAILED!")
                } else {
                    game.CreatePlayersBar(data);
                    this.DataServerCoroutine(game);
                }
            })
    }
}