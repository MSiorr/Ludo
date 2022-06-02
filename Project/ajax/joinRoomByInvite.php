<?php

    session_start();

    include('config.php');
    $mysqli = mysqli_connect($host, $user, $passwd, $db);
    mysqli_query($mysqli, "set names utf8");

    if(isset($_POST['inviteCode'], $_POST['nick'])){

        $res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE inviteCode = '$_POST[inviteCode]'");
        $arr = mysqli_fetch_assoc($res);

        if($arr != null && $arr['playerCount'] < 4){

            $colorList = array("red", "green", "yellow", "blue");
            $playerColor = null;
            $nick = null;

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
                "status" => true,
                "data" => $data,
                "roomStatus" => $arr['roomStatus'],
                "myNick" => $nick,
                "myColor" => $playerColor,
                "privateRoom" => $privateRoom,
                "inviteCode" => $inviteCode
            ]);
        } else {
            echo json_encode([
                "status" => false
            ]);
        }

    } else {
        echo json_encode([
            "status" => false
        ]);
    }
