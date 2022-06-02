import { boardData } from "./boardData.js";
import { FetchManager } from "./FetchManager.js";

export { Game };

class Game {

    constructor() {
        this.mainDiv = null;
        this.buttonReadyDiv = null;
        this.roomInfoDiv = null;
        this.throwDiceButton = null;
        this.diceDiv = null;
        this.gameBoard = null;
        this.moveDivParent = null;
        this.endGameDiv = null;
        this.timeDiv = null;
        this.MainMenuBtns = null;

        this.throwDiceAnimTimeout = null;
        this.preloadImgList = [];

        this.nick = null;
        this.playersList = [];
        this.dataInterval = null;
        this.gameStart = false;

        this.synth = null;
        this.myVoice = null;

        this.playerTimeInterval = null;

        this.fieldRadius = 18;
        this.fieldPadding = 16;
        this.pawnPadding = 5;
        this.pawnSize = this.fieldRadius - this.pawnPadding;

        this.changeMyTime = false;

        this.Start();
    }

    Start(restart = false) {
        if(restart == false || this.mainDiv == null){
            this.mainDiv = document.createElement("div");
            this.mainDiv.id = "mainDiv";
            document.body.appendChild(this.mainDiv)
        } else {
            this.mainDiv.innerHTML = '';
        }

        if(this.endGameDiv != null){
            if(Object.values(document.body.children).includes(this.endGameDiv)){
                document.body.removeChild(this.endGameDiv);
            }
            this.endGameDiv = null;
        }
        if(restart == false){

            // IMG PRELOAD

            let colorList = ['red', 'green', 'blue', 'yellow'];
            colorList.forEach( e => {
                for(let i = 1; i <= 6; i++){
                    let img = document.createElement("img");
                    img.src = `./img/dice/${e}/${i}.png`
                    this.preloadImgList.push(img);
                }
            })

            FetchManager.StartPage(this);

        } else {

            this.nick = null;
            this.playersList = [];
            this.dataInterval = null;
            this.gameStart = false;
            FetchManager.StartPage(this, true);

        }
    }

    CreatePlayer(privateRoom = null, inviteCode = null) {
        this.mainDiv.innerHTML = "";

        let loginBackgroundDiv = document.createElement("div");
        loginBackgroundDiv.id = "loginBackgroundDiv";
    
        let labelInfo = document.createElement("label");
        labelInfo.id = "labelInfo";
        labelInfo.innerHTML = "Podaj nick: "
    
        let nickInput = document.createElement("input");
        nickInput.type = "text";
        nickInput.maxLength = 20;
        nickInput.autocomplete = "off";
        nickInput.id = "nickInput";
    
        let joinBtn = document.createElement("button");
        joinBtn.id = "joinBtn";
        joinBtn.innerHTML = "JOIN";
    
        joinBtn.onclick = () => {
            if (nickInput.value != "") {
                this.nick = nickInput.value
                loginBackgroundDiv.style.display = "none";
                if(inviteCode == null){
                    if(privateRoom == null){
                        FetchManager.AddPlayerToGame(this, this.nick);
                    } else {
                        FetchManager.AddPlayerToGame(this, this.nick, privateRoom);
                    }
                } else {
                    FetchManager.JoinRoomByInviteFetch(this, this.nick, inviteCode);
                }
            }
        }
    
        loginBackgroundDiv.appendChild(labelInfo);
        loginBackgroundDiv.appendChild(nickInput);
        loginBackgroundDiv.appendChild(joinBtn);
        this.mainDiv.appendChild(loginBackgroundDiv);
    }

    CreatePlayersBar(data) {
        let playersDiv = document.createElement("div");
        playersDiv.id = "playersDiv";
    
        for (let i = 0; i < 4; i++) {
            let player = document.createElement("div");
            player.classList.add("playerDiv");
            player.innerHTML = "?";
            playersDiv.appendChild(player);
            this.playersList.push(player);
        }
    
        let myPlaceFound = false;
    
        for (let i = 0; i < data.data.length; i++) {
            if (data.data[i].color == data.myColor) {
                this.playersList[0].innerText = data.myNick;
                this.playersList[0].classList.add(data.myColor);
                if (data.data[i].status != 2 && data.data[i].status != 3) {
                    this.playersList[0].classList.add((data.data[i].status) != 1 ? "notReady" : "ready")
                }
                myPlaceFound = true;
            } else {
                if (myPlaceFound == false) {
                    this.playersList[i + 1].innerText = data.data[i].nick;
                    this.playersList[i + 1].classList.add(data.data[i].color);
                    if (data.data[i].status != 2 && data.data[i].status != 3) {
                        this.playersList[i + 1].classList.add((data.data[i].status) != 1 ? "notReady" : "ready")
                    }
                } else {
                    this.playersList[i].innerText = data.data[i].nick;
                    this.playersList[i].classList.add(data.data[i].color);
                    if (data.data[i].status != 2 && data.data[i].status != 3) {
                        this.playersList[i].classList.add((data.data[i].status) != 1 ? "notReady" : "ready")
                    }
                }
            }
        }
    
    
        this.mainDiv.appendChild(playersDiv);
        if (data.roomStatus == 0) {
            this.CreateReadyBtn();
            this.CreateRoomInfo(data.privateRoom, data.inviteCode);
        } else {
            this.CreateGameBoardDiv();
        }
    }

    CreateReadyBtn() {
        this.buttonReadyDiv = document.createElement("div");
        this.buttonReadyDiv.id = "buttonReadyDiv";
    
        let btnReady = document.createElement("label");
        btnReady.id = "btnLabel";
    
        let inputCheck = document.createElement("input");
        inputCheck.type = "checkbox"
        inputCheck.id = "btnInput";
        if (this.playersList[0].classList.contains("ready")) inputCheck.checked = true;
    
        inputCheck.onclick = (e) => {
            FetchManager.ChangePlayerStatusFetch(this, (e.target.checked) ? 1 : 0);
            this.playersList[0].classList.remove((e.target.checked) == true ? "notReady" : "ready")
            this.playersList[0].classList.add((e.target.checked) != true ? "notReady" : "ready")
        }
    
        let sliderBtn = document.createElement("div");
        sliderBtn.id = "btnSlider";
    
        let spanReady = document.createElement("span");
        spanReady.classList.add("spanReady")
        spanReady.innerHTML = "READY";
    
        let spanNotReady = document.createElement("span");
        spanNotReady.classList.add("spanNotReady")
        spanNotReady.innerHTML = "NOT READY";
    
        sliderBtn.appendChild(spanReady);
        sliderBtn.appendChild(spanNotReady);
    
        btnReady.appendChild(inputCheck);
        btnReady.appendChild(sliderBtn);
    
        this.buttonReadyDiv.appendChild(btnReady);
    
        this.mainDiv.appendChild(this.buttonReadyDiv);
    }

    CreateRoomInfo(roomPrivate, inviteCode){
        this.roomInfoDiv = document.createElement("div");
        this.roomInfoDiv.id = "roomInfoDiv";

        let firstSpan = document.createElement("span");
        firstSpan.id = "firstRoomInfoSpan";
        firstSpan.innerHTML = `ROOM TYPE : ${(roomPrivate) == true ? 'PRIVATE' : 'PUBLIC'}`

        this.roomInfoDiv.appendChild(firstSpan);

        let secondSpan = document.createElement("span");
        secondSpan.id = "secondRoomInfoSpan";
        secondSpan.innerHTML = `INVITE CODE : ${inviteCode}`

        this.roomInfoDiv.appendChild(secondSpan)

        this.mainDiv.appendChild(this.roomInfoDiv);
    }

    UpdatePlayersBar(data) {

        let changeMyTime = () => {
            if(this.changeMyTime == false){
                FetchManager.DataServerCoroutine(this, true)
                this.changeMyTime = true;
            }
        }
    
        let timeForCurrentPlayer = (div, roomData, currentTime) => {
            this.timeDiv = document.createElement("div");
            this.timeDiv.classList.add("playerTime");
            let fastTime = Math.round((roomData.roundTime - currentTime) / 1000)
            if (this.timeDiv.innerHTML == '' || parseInt(this.timeDiv.innerHTML) > fastTime) {
                this.timeDiv.innerHTML = `${(fastTime) > 0 ? fastTime : 0}`;
            }
            div.appendChild(this.timeDiv)
    
            if (fastTime > 0) {
                if (this.playerTimeInterval != null) {
                    clearInterval(this.playerTimeInterval);
                }
                let startIntervalTime = Date.now();
                this.playerTimeInterval = setInterval((serverTime) => {
                    let time = Math.round((serverTime - currentTime - (Date.now() - startIntervalTime)) / 1000);
                    if (parseInt(this.timeDiv.innerHTML) > time) {
                        this.timeDiv.innerHTML = `${(time) > 0 ? time : 0}`;
                    }
                    if (time <= 0) {
                        clearInterval(this.playerTimeInterval)
                        this.playerTimeInterval = null;
                        changeMyTime();
                    }
                }, (1000 / 60), roomData.roundTime)
            }
        }

        if (this.playersList[0].innerText != "") {
            let roomData = data.baseData;
            let currentTime = data.currentTime;
            let meFound = false;
            for (let i = 0; i < 4; i++) {
                if(i < roomData.data.length){
                    if (data.myColor != roomData.data[i].color) {
                        this.playersList[i + (1 * !meFound)].innerText = roomData.data[i].nick;
                        this.playersList[i + (1 * !meFound)].className = `playerDiv ${roomData.data[i].color}`;
                        if (roomData.data[i].status != 2 && roomData.data[i].status != 3) {
                            this.playersList[i + (1 * !meFound)].classList.remove((roomData.data[i].status) == 1 ? "notReady" : "ready")
                            this.playersList[i + (1 * !meFound)].classList.add((roomData.data[i].status) != 1 ? "notReady" : "ready")
                        } else {
                            this.playersList[i + (1 * !meFound)].classList.remove("notReady")
                            this.playersList[i + (1 * !meFound)].classList.remove("ready")
                        }
                        if (roomData.data[i].playerID == roomData.currentPlayer) {
                            timeForCurrentPlayer(this.playersList[i + (1 * !meFound)], roomData, currentTime)
                        }
                    } else {
                        meFound = true;
                        this.playersList[0].innerText = roomData.data[i].nick;
                        if (roomData.data[i].status == 2 || roomData.data[i].status == 3) {
                            this.playersList[0].classList.remove("notReady")
                            this.playersList[0].classList.remove("ready")
                        }
                        if (roomData.data[i].playerID == roomData.currentPlayer) {
                            timeForCurrentPlayer(this.playersList[0], roomData, currentTime)
                        }
                    }
                } else {
                    this.playersList[i + (1 * !meFound)].innerHTML = "?";
                    this.playersList[i + (1 * !meFound)].className = 'playerDiv';
                }
            }
        }        
    }

    DataParser(data) {
        data.baseData.data = JSON.parse(data.baseData.data)
        this.UpdatePlayersBar(data)
        if (this.gameStart == false && data.baseData.roomStatus == 1) {
            let pawnData = JSON.parse(data.baseData.pawnData);
            this.PrepareGame(pawnData);
        }
        if (data.baseData.roomStatus == 1 && this.throwDiceButton != null) {
            let pawnData = null;
            if (data.baseData.pawnData != null) {
                pawnData = JSON.parse(data.baseData.pawnData);
            }
            this.CreateGameBoard(pawnData);
            if (data.myTurn == true) {
                if (data.needThrow == true) {
                    this.diceDiv.style.opacity = '0';
                    this.throwDiceAnimTimeout = setTimeout(() => {
                        if (this.diceDiv.style.opacity == '0' && this.throwDiceAnimTimeout != null) {
                            this.throwDiceButton.style.display = "block";
                            this.diceDiv.style.backgroundImage = "none";
                            this.diceDiv.style.transition = "transform 0s opacity .5s";
                            this.diceDiv.style.transform = "rotate(0deg)";
                            this.diceDiv.style.transition = "transform 1s opacity .5s";
                            this.throwDiceAnimTimeout = null;
                        }
                    }, 501)
                } else {
                    this.throwDiceButton.style.display = "none";
                    let lastThrow = JSON.parse(data.baseData.lastThrow);
                    if (lastThrow != null) {
                        let url = `url("./img/dice/${lastThrow.color}/${lastThrow.value}.png")`;
    
                        if (this.diceDiv.style.backgroundImage !== url) {
                            this.diceDiv.style.opacity = '0';
                            setTimeout(() => {
                                this.diceDiv.style.backgroundImage = url
                                this.diceDiv.style.opacity = '1';
                            }, 500)
                        }
                    }
                }
            } else {
                this.moveDivParent.innerHTML = "";
                this.throwDiceButton.style.display = "none";
                let lastThrow = JSON.parse(data.baseData.lastThrow);
                if (lastThrow != null) {
                    let url = `url("./img/dice/${lastThrow.color}/${lastThrow.value}.png")`;
    
                    if (this.diceDiv.style.backgroundImage !== url) {
                        this.diceDiv.style.opacity = '0';
                        setTimeout(() => {
                            this.diceDiv.style.backgroundImage = url
                            this.diceDiv.style.opacity = '1';
                        }, 500)
                    }
                } 
            }
        }
    }

    PrepareGame(pawnData) {
        this.gameStart = true;
        if (this.buttonReadyDiv != null) {
            this.CreateGameBoardDiv();
            this.CreateGameBoard(pawnData);
            this.buttonReadyDiv.style.display = "none";
            this.buttonReadyDiv = null;
            if(this.roomInfoDiv != null){
                this.roomInfoDiv.style.display = "none";
                this.roomInfoDiv = null;
            }
        }
    }

    CreateGameBoardDiv() {
        this.gameBoard = document.createElement("div");
        this.gameBoard.id = "gameBoard";
        this.gameBoard.style.width = 16 * this.fieldPadding + (15 * this.fieldRadius * 2) + "px";
        this.gameBoard.style.height = 16 * this.fieldPadding + (15 * this.fieldRadius * 2) + "px";
    
        this.moveDivParent = document.createElement("div");
        this.moveDivParent.id = "moveDivParent";
    
        this.gameBoard.appendChild(this.moveDivParent);
    
        this.throwDiceButton = document.createElement("button");
        this.throwDiceButton.id = "throwDiceButton";
        this.throwDiceButton.innerHTML = "THROW DICE"
        this.throwDiceButton.style.display = "none";
    
        this.throwDiceButton.onclick = (e) => {
            e.target.style.display = "none";
            FetchManager.ThrowDiceFetch(this);
        }
    
        this.diceDiv = document.createElement("div");
        this.diceDiv.id = "diceImg";
        this.gameBoard.appendChild(this.diceDiv);
    
        let board = document.createElement("canvas");
        board.id = "board";
        board.width = 16 * this.fieldPadding + (15 * this.fieldRadius * 2);
        board.height = 16 * this.fieldPadding + (15 * this.fieldRadius * 2);
    
        this.gameBoard.appendChild(board);
    
        this.gameBoard.appendChild(this.throwDiceButton)
        this.mainDiv.appendChild(this.gameBoard);
    
    }

    CreateGameBoard(pawnData) {
        let colors = {
            "red": "rgb(237,28,36)",
            "redA": "rgba(237,28,36,0.1)",
            "blue": "rgb(63,72,204)",
            "blueA": "rgba(63,72,204,0.1)",
            "green": "rgb(34,177,76)",
            "greenA": "rgba(34,177,76,0.1)",
            "yellow": "rgb(255,242,0)",
            "yellowA": "rgba(255,242,0,0.1)"
        }
    
        let board = document.getElementById("board");
    
        let ctx = board.getContext("2d");
        ctx.clearRect(0, 0, 16 * this.fieldPadding + (15 * this.fieldRadius * 2), 16 * this.fieldPadding + (15 * this.fieldRadius * 2))
    
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (((i < 2 && j < 2) || (i > 12 && j < 2) || (i < 2 && j > 12) || (i > 12 && j > 12) || (j > 5 && j < 9) || (i > 5 && i < 9) || (i > 4 && j > 4 && i < 10 && j < 10)) && (Math.abs(i - 7) + Math.abs(j - 7) >= 3)) {
                    let x = this.fieldPadding + this.fieldRadius + (i * this.fieldPadding) + (i * this.fieldRadius * 2);
                    let y = this.fieldPadding + this.fieldRadius + (j * this.fieldPadding) + (j * this.fieldRadius * 2);
                    ctx.beginPath();
                    ctx.arc(x, y, this.fieldRadius, 0, 2 * Math.PI);
                    if ((i < 2 && j < 2) || (j == 7 && i > 0 && i < 5) || (j == 6 && i == 0)) { // red
                        ctx.strokeStyle = colors["red"];
                        ctx.fillStyle = colors["redA"];
                    } else if ((i > 12 && j < 2) || (i == 7 && j > 0 && j < 5) || (j == 0 && i == 8)) {  // blue
                        ctx.strokeStyle = colors["blue"];
                        ctx.fillStyle = colors["blueA"];
                    } else if ((i < 2 && j > 12) || (i == 7 && j > 9 && j < 14) || (j == 14 && i == 6)) {  // yellow
                        ctx.strokeStyle = colors["yellow"];
                        ctx.fillStyle = colors["yellowA"];
                    } else if ((i > 12 && j > 12) || (j == 7 && i > 9 && i < 14) || (j == 8 && i == 14)) {  // green
                        ctx.strokeStyle = colors["green"];
                        ctx.fillStyle = colors["greenA"];
                    } else {
                        ctx.strokeStyle = "white";
                        ctx.fillStyle = "transparent";
                    }
                    ctx.stroke();
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    
        pawnData.forEach((e) => {
            e.pawnPlace.forEach((i) => {
                let newData = i.split("_");
                let positions = boardData[newData[0]][newData[1]];
    
                let x = this.fieldPadding + this.fieldRadius + (positions.x * this.fieldPadding) + (positions.x * this.fieldRadius * 2);
                let y = this.fieldPadding + this.fieldRadius + (positions.y * this.fieldPadding) + (positions.y * this.fieldRadius * 2);
    
                ctx.beginPath();
                ctx.arc(x, y, this.pawnSize, 0, 2 * Math.PI);
                ctx.strokeStyle = colors[e.color];
                ctx.fillStyle = colors[e.color];
                ctx.stroke();
                ctx.fill();
                ctx.closePath();
            })
        })

        let samePositions = [];
        pawnData.forEach( e => {
            let position = null;
            let count = 0;
            let fastTable = JSON.parse(JSON.stringify(e.pawnPlace));
            fastTable.sort();

            fastTable.forEach( i => {
                if(position != i){
                    if(count > 1){
                        samePositions.push({
                            position: position,
                            count: count
                        })
                    }
                    position = i;
                    count = 1;
                } else {
                    count++;
                }
            })
            if(count > 1){
                samePositions.push({
                    position: position,
                    count: count
                })
            }
        })
        samePositions.forEach( e => {
            let newData = e.position.split('_');
            let positions = boardData[newData[0]][newData[1]];

            let x = this.fieldPadding + this.fieldRadius + (positions.x * this.fieldPadding) + (positions.x * this.fieldRadius * 2);
            let y = this.fieldPadding + (this.fieldRadius * 1.5) + (positions.y * this.fieldPadding) + (positions.y * this.fieldRadius * 2);

            ctx.beginPath();
            ctx.font = "24px Trebuchet MS";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(e.count, x, y)
            ctx.closePath();
        })
    }

    CreateSynth() {
        this.synth = window.speechSynthesis;
    
        let populateVoiceList = () => {
            let voices = this.synth.getVoices();
    
            let plLang = [];
    
            voices.forEach(e => {
                if (e.lang == "pl-PL") {
                    plLang.push(e);
                }
            })
            if (plLang.length > 0) {
                let paulinaFound = false;
                plLang.forEach(e => {
                    if (e.name.includes("Paulina")) {
                        paulinaFound = true;
                        this.myVoice = e;
                    }
                })
                if (paulinaFound == false) {
                    this.myVoice = plLang[0];
                }
            } else {
                this.myVoice = voices[0];
            }
        }
    
    
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }
    }

    CreateMoveDivs(data) {
        this.moveDivParent.innerHTML = "";
    
        data.forEach((e, i) => {
            if (e.canMove == true) {
                let posData = e.pawn.split("_");
                let positions = boardData[posData[0]][posData[1]];
    
                let moveDiv = document.createElement("div");
                moveDiv.classList.add("moveDiv");
    
                let x = this.fieldPadding + (positions.x * this.fieldPadding) + (positions.x * this.fieldRadius * 2) + this.pawnPadding;
                let y = this.fieldPadding + (positions.y * this.fieldPadding) + (positions.y * this.fieldRadius * 2) + this.pawnPadding;
    
                moveDiv.style.left = x + "px";
                moveDiv.style.top = y + "px";
                moveDiv.style.width = this.pawnSize * 2 + "px";
                moveDiv.style.height = this.pawnSize * 2 + "px";
                this.moveDivParent.appendChild(moveDiv);
    
                let hintPos = null;
    
                moveDiv.onmouseover = () => {
                    let futurePawn = e.futurePawn.split("_");
                    let futurePositions = boardData[futurePawn[0]][futurePawn[1]];
                    hintPos = document.createElement("div");
                    hintPos.classList.add("hintPawn");
    
                    let x = this.fieldPadding + (futurePositions.x * this.fieldPadding) + (futurePositions.x * this.fieldRadius * 2) + this.pawnPadding;
                    let y = this.fieldPadding + (futurePositions.y * this.fieldPadding) + (futurePositions.y * this.fieldRadius * 2) + this.pawnPadding;
    
                    hintPos.style.left = x + "px";
                    hintPos.style.top = y + "px";
                    hintPos.style.width = this.pawnSize * 2 + "px";
                    hintPos.style.height = this.pawnSize * 2 + "px";
    
                    this.moveDivParent.appendChild(hintPos);
                }
    
                moveDiv.onmouseout = () => {
                    if (Object.values(this.moveDivParent.children).includes(hintPos)) {
                        this.moveDivParent.removeChild(hintPos)
                        hintPos = null;
                    }
                }
    
                moveDiv.onclick = () => {
                    FetchManager.ExecuteMoveFetch(this,i);
                    this.moveDivParent.innerHTML = "";
                }
            }
        })
    }

    CreateEndGameScreen(leaderBoardData, myColor) {
        clearInterval(this.dataInterval);
        this.dataInterval = null;
        if (this.endGameDiv == null) {
            this.endGameDiv = document.createElement("div");
            this.endGameDiv.id = "endGameDiv";
            this.endGameDiv.style.opacity = "0";
    
            let leaderBoardTitle = document.createElement("div");
            leaderBoardTitle.id = "leaderBoardTitle";
            leaderBoardTitle.innerText = "LEADERBOARD"
            this.endGameDiv.appendChild(leaderBoardTitle)
    
            let leaderBoardTableDiv = document.createElement("div");
            leaderBoardTableDiv.id = "leaderBoardTableDiv";
    
            let leaderBoard = document.createElement("table");
            leaderBoard.id = "leaderBoard";
    
            let trList = [];
            if(leaderBoardData != null){
                for (let i = 0; i < leaderBoardData.length; i++) {
                    if (i == 0) {
                        let trHead = document.createElement("tr");
                        let thHead1 = document.createElement("th");
                        let thHead2 = document.createElement("th");
        
                        thHead1.innerHTML = "PLACE";
                        thHead2.innerHTML = "NICK";
        
                        trHead.appendChild(thHead1);
                        trHead.appendChild(thHead2);
                        leaderBoard.appendChild(trHead);
                    }
        
                    let tr = document.createElement("tr");
                    tr.classList.add("animatedTR");
                    tr.style.opacity = '0';
                    let td1 = document.createElement("td");
                    let td2 = document.createElement("td");
        
                    let td1Img = document.createElement("img");
                    td1Img.classList.add("leaderBoardImg");
                    td1Img.src = `./img/dice/${leaderBoardData[i].color}/${i + 1}.png`
        
                    let td2Sapn = document.createElement("span");
                    td2Sapn.classList.add("leaderBoardNick");
                    if (leaderBoardData[i].color == myColor) {
                        td2Sapn.style.color = myColor;
                    }
                    td2Sapn.innerText = leaderBoardData[i].nick;
        
                    td1.appendChild(td1Img);
                    td2.appendChild(td2Sapn);
        
                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    leaderBoard.appendChild(tr);
                    trList.push(tr);
                }

                let toMainMenuBtn = document.createElement("button");
                toMainMenuBtn.id = "toMainMenuBtn";
                toMainMenuBtn.innerText = "Main Menu";
                toMainMenuBtn.onclick = () => {
                    this.Start(true);
                }
        
                leaderBoardTableDiv.appendChild(leaderBoard);
                this.endGameDiv.appendChild(leaderBoardTableDiv);
                this.endGameDiv.appendChild(toMainMenuBtn);
                document.body.appendChild(this.endGameDiv);
                document.body.removeChild(this.mainDiv);
                this.mainDiv = null;
        
                setTimeout(() => {
                    this.endGameDiv.style.opacity = "1";
                    setTimeout(() => {
                        let index = trList.length - 1;
                        let animatedDisplay = setInterval(() => {
                            trList[index].style.opacity = "1";
                            index--;
                            if (index < 0) {
                                clearInterval(animatedDisplay);
                            }
                        }, 1000);
                    }, 2000);
                }, 1);
            }    
        }
    }

    CreateMainMenuPage(){
        this.startMenuDiv = document.createElement("div");
        this.startMenuDiv.id = "startMenuDiv";

        let titleDiv = document.createElement("div");
        titleDiv.id = "titleDiv";
        titleDiv.innerHTML = "CHIŃCZYK";

        this.startMenuDiv.appendChild(titleDiv);

        this.MainMenuBtns = document.createElement("div");
        this.MainMenuBtns.id = "menu";

        let fastGameBtn = document.createElement("button");
        fastGameBtn.classList.add("menuBtn");

        let searchRoomsBtn = document.createElement("button");
        searchRoomsBtn.classList.add("menuBtn");

        let colorList = ['red', 'green', 'blue', 'yellow'];
        
        let randColor1 = colorList[Math.floor(Math.random() * colorList.length)]
        colorList.splice(colorList.indexOf(randColor1), 1);
        let randColor2 = colorList[Math.floor(Math.random() * colorList.length)]

        let randVal1 = Math.ceil(Math.random() * 6);
        let randVal2 = Math.ceil(Math.random() * 6);

        let dice1Src = `./img/dice/${randColor1}/${randVal1}.png`;
        let dice2Src = `./img/dice/${randColor2}/${randVal2}.png`;

        fastGameBtn.innerHTML = `\
            <img src=${dice1Src} class='menuBtnImg menuBtnLeft' >\
            Fast Game\
            <img src=${dice1Src} class='menuBtnImg menuBtnRight' >\
        `
        searchRoomsBtn.innerHTML = `\
            <img src=${dice2Src} class='menuBtnImg menuBtnLeft' >\
            Search Rooms\
            <img src=${dice2Src} class='menuBtnImg menuBtnRight' >\
        `

        this.MainMenuBtns.appendChild(fastGameBtn);
        this.MainMenuBtns.appendChild(searchRoomsBtn);

        fastGameBtn.onclick = () => {
            this.mainDiv.removeChild(this.startMenuDiv);
            this.startMenuDiv = null;
            this.CreatePlayer();
        }

        searchRoomsBtn.onclick = () => {
            this.MainMenuBtns.style.display = "none";
            this.CreateRoomsList();
        }

        this.startMenuDiv.appendChild(this.MainMenuBtns);
        this.mainDiv.appendChild(this.startMenuDiv);
    }

    CreateRoomsList(){
        let roomsListDiv = document.createElement("div");
        roomsListDiv.id = "roomsListDiv";

        let roomListTitle = document.createElement("div");
        roomListTitle.id = "roomListTitle";
        roomListTitle.innerHTML = "ROOM LIST";

        let refreshRoomListBtn = document.createElement("div");
        refreshRoomListBtn.id = "refreshRoomListBtn";
        refreshRoomListBtn.innerHTML = "&#x21bb;";

        let closeRoomListBtn = document.createElement("div");
        closeRoomListBtn.id = "closeRoomListBtn";
        closeRoomListBtn.innerHTML = "&#10006;";

        roomListTitle.appendChild(refreshRoomListBtn);
        roomListTitle.appendChild(closeRoomListBtn);
        roomsListDiv.appendChild(roomListTitle);

        refreshRoomListBtn.onclick = () => {
            FetchManager.GetRoomsFetch(this, list);
        }

        closeRoomListBtn.onclick = () => {
            this.MainMenuBtns.style.display = "flex";
            this.startMenuDiv.removeChild(roomsListDiv);
        }



        let mainRoomListDiv = document.createElement("div");
        mainRoomListDiv.id = "mainRoomListDiv";

        let list = document.createElement("div");
        list.id = "list";

        let roomsTools = document.createElement("div");
        roomsTools.id = "roomsTools";



        let inviteToolDiv = document.createElement("div");
        inviteToolDiv.id = "inviteToolDiv";

        let inviteCodeInput = document.createElement("input");
        inviteCodeInput.id = "inviteCodeInput";
        inviteCodeInput.placeholder = "Invite Code";

        let joinBtn = document.createElement("div");
        joinBtn.id = "joinInviteBtn";
        joinBtn.classList.add("toolBtn");
        joinBtn.innerHTML = "JOIN";

        joinBtn.onclick = () => {
            let inviteCode = inviteCodeInput.value;
            if(inviteCode != ''){
                inviteCodeInput.value = '';
                this.CreatePlayer(false, inviteCode)
            }
        }

        inviteToolDiv.appendChild(inviteCodeInput);
        inviteToolDiv.appendChild(joinBtn);



        let createRoomToolDiv = document.createElement("div");
        createRoomToolDiv.id = "createRoomToolDiv";

        let roomTypeDiv = document.createElement("div");
        roomTypeDiv.id = "roomTypeDiv";


        let privateRoom = false;


        let publicBtn = document.createElement("div");
        publicBtn.id = "publicBtn";
        publicBtn.classList.add("roomTypeBtn");
        publicBtn.classList.add("selectedRoomType");
        publicBtn.innerHTML = "public";

        let privateBtn = document.createElement("div");
        privateBtn.id = "privateBtn";
        privateBtn.classList.add("roomTypeBtn");
        privateBtn.classList.add("notSelectedRoomType");
        privateBtn.innerHTML = "private";

        publicBtn.onclick = () => {
            if(privateRoom == true){
                privateRoom = false;
                publicBtn.classList.remove("notSelectedRoomType");
                privateBtn.classList.remove("selectedRoomType");
                publicBtn.classList.add("selectedRoomType");
                privateBtn.classList.add("notSelectedRoomType");
            }
        }
        privateBtn.onclick = () => {
            if(privateRoom == false){
                privateRoom = true;
                publicBtn.classList.remove("selectedRoomType");
                privateBtn.classList.remove("notSelectedRoomType");
                publicBtn.classList.add("notSelectedRoomType");
                privateBtn.classList.add("selectedRoomType");
            }
        }

        roomTypeDiv.appendChild(publicBtn);
        roomTypeDiv.appendChild(privateBtn);


        let createRoomBtn = document.createElement("button");
        createRoomBtn.id = "createRoomBtn";
        createRoomBtn.classList.add('toolBtn');
        createRoomBtn.innerHTML = "Create Room";

        createRoomBtn.onclick = () => {
            this.CreatePlayer(privateRoom);
        }

        createRoomToolDiv.appendChild(roomTypeDiv);
        createRoomToolDiv.appendChild(createRoomBtn);

        roomsTools.appendChild(inviteToolDiv);
        roomsTools.appendChild(createRoomToolDiv);

        mainRoomListDiv.appendChild(list);
        mainRoomListDiv.appendChild(roomsTools);

        roomsListDiv.appendChild(mainRoomListDiv);
        this.startMenuDiv.appendChild(roomsListDiv);

        FetchManager.GetRoomsFetch(this, list);
    }

    FillRoomList(rooms, listDiv){
        listDiv.innerHTML = "";
        rooms.forEach( (e,i) => {
            let roomListItem = document.createElement("div");
            roomListItem.classList.add("roomListItem");

            let spanID = document.createElement("span");
            spanID.classList.add("roomListSpanID");
            spanID.innerHTML = i;

            let playerInfoSpan = document.createElement("span");
            playerInfoSpan.classList.add("roomListPlayerInfoSpan");
            playerInfoSpan.innerHTML = "Player Count : " + e.playerCount;

            let roomListJoinBtn = document.createElement("button");
            roomListJoinBtn.classList.add("roomListJoinBtn");
            roomListJoinBtn.innerHTML = "JOIN ROOM >>>";

            roomListJoinBtn.onclick = () => {
                this.CreatePlayer(false, e.inviteCode)
            }

            roomListItem.appendChild(spanID);
            roomListItem.appendChild(playerInfoSpan);
            roomListItem.appendChild(roomListJoinBtn);

            listDiv.appendChild(roomListItem);
        })
    }

}