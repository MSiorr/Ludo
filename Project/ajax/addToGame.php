<?php

    session_start();

    include('config.php');
    $mysqli = mysqli_connect($host, $user, $passwd, $db);
    mysqli_query($mysqli, "set names utf8");

    $colorList = array("red", "green", "yellow", "blue");
    $playerColor = null;
    $nick = null;

    $res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE roomStatus=0 AND privateRoom=0 AND playerCount<4 ORDER BY ID ASC LIMIT 1");
    $arr = mysqli_fetch_assoc($res);

    
    if(isset($_POST['nick'])){
        if(isset($_POST['private']) == false){
            if($arr != null){
                $nick = rawurldecode($_POST['nick']);
                if(mb_strlen($nick, 'UTF-8') > 20){
                    $nick = mb_substr($nick, 0, 20, 'UTF-8');
                }
                $playersData = (array)json_decode($arr['data'],true);  
                $colorToPick = $colorList;
                foreach( $playersData as $player){
                    array_splice($colorToPick, array_search($player['color'],$colorToPick), 1);
                }
    
                $playerColor = $colorToPick[rand(0,count($colorToPick)-1)];

                $newPlayerCount = $arr['playerCount'] + 1;

                $playerID = uniqid();
                $playerIDPassed = false;

                while($playerIDPassed == false){
                    $playerIDPassed = true;
                    foreach($playersData as $player) {
                        if($player['playerID'] == $playerID ){
                            $playerIDPassed = false;
                            $playerID = uniqid();
                            break;
                        }
                    }
                }
    
                array_push($playersData, (Array)[
                    "playerID" => $playerID,
                    "nick" => $nick,
                    "color" => $playerColor,
                    "status" => 0,
                    "skipTurnCount" => 0,
                    "joinTime" => round(microtime(true) * 1000)
                ]);
                
    
                $newData = json_encode($playersData, JSON_UNESCAPED_UNICODE);
                $ID = $arr['ID'];
    
                $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.playerCount = ?, room_data.data = ? WHERE room_data.ID = ?");
                mysqli_stmt_bind_param($stmt, "isi", $newPlayerCount, $newData, $ID);
                mysqli_stmt_execute($stmt);
    
                $_SESSION["roomID"] = $arr["roomID"];
                $_SESSION["playerID"] = $playerID;

                $privateRoom =  boolval($arr['privateRoom']);
                $inviteCode = $arr['inviteCode'];
                
                $res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE room_data.ID = '$ID'");
                $arr = mysqli_fetch_assoc($res);
                $data = json_decode($arr["data"]);
                echo json_encode((object)[
                    "data" => $data,
                    "roomStatus" => $arr['roomStatus'],
                    "myNick" => $nick,
                    "myColor" => $playerColor,
                    "privateRoom" => $privateRoom,
                    "inviteCode" => $inviteCode
                ]);
            } else {
                newRoom(false);
            }
        } else {
            newRoom($_POST['private']);
        }
    }

    function newRoom($private) {
        global $mysqli;
        global $colorList;
        global $_SESSION;

        $nick = rawurldecode($_POST['nick']);
        if(mb_strlen($nick, 'UTF-8') > 20){
            $nick = mb_substr($nick, 0, 20, 'UTF-8');
        } 
        $roundTime = round(microtime(true) * 1000);
        $privateRoom = $private;
        $playerCount = 1;
        $idPassed = false;
        $roomID = null;
        
        $invitePassed = false;
        $inviteCode = false;

        $playerID = uniqid();
        $roomStatus = 0;

        while($idPassed == false){
            $roomID = uniqid();
            $res = mysqli_query($mysqli, "SELECT roomID FROM room_data WHERE room_data.roomID = '$roomID'");
            $arr = mysqli_fetch_all($res, MYSQLI_ASSOC);

            if(count($arr) == 0){
                $idPassed = true;
            }
        }

        while($invitePassed == false){
            $inviteCode = uniqid();
            $res = mysqli_query($mysqli, "SELECT inviteCode FROM room_data WHERE room_data.inviteCode = '$inviteCode'");
            $arr = mysqli_fetch_all($res, MYSQLI_ASSOC);

            if(count($arr) == 0){
                $invitePassed = true;
            }
        }

        while($playerID == $roomID){
            $playerID = uniqid();
        }
        

        $playerColor = $colorList[rand(0,count($colorList)-1)];

        $playerData = (Array)[
            "playerID" => $playerID,
            "nick" => $nick,
            "color" => $playerColor,
            "status" => 0,
            "skipTurnCount" => 0,
            "joinTime" => round(microtime(true) * 1000)
        ];

        $data = json_encode(array($playerData), JSON_UNESCAPED_UNICODE);

        $stmt = mysqli_prepare($mysqli, "INSERT INTO room_data(roomID, privateRoom, inviteCode, roomStatus, playerCount, roundTime, data) VALUES (?, ?, ?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "sisiiis", $roomID, $privateRoom, $inviteCode, $roomStatus, $playerCount, $roundTime, $data);
        mysqli_stmt_execute($stmt);

        $_SESSION["roomID"] = $roomID;
        $_SESSION["playerID"] = $playerID;

        $res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE room_data.roomID = '$roomID'");
        $arr = mysqli_fetch_assoc($res);
        $data = json_decode($arr['data']);
        echo json_encode((object)[
            "data" => $data,
            "roomStatus" => $arr['roomStatus'],
            "myNick" => $nick,
            "myColor" => $playerColor,
            "privateRoom" => $privateRoom,
            "inviteCode" => $inviteCode
        ]);
    }
?>