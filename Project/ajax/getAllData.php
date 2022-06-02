<?php

session_start();

include('config.php');
$mysqli = mysqli_connect($host, $user, $passwd, $db);
mysqli_query($mysqli, "set names utf8");

$roomID = $_SESSION['roomID'];
$res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE roomID = '$roomID'");
$arr = mysqli_fetch_assoc($res);

if ($arr != null) {
    $data = json_decode($arr['data'],  true);

    $meFound = false;
    foreach($data as $player){
        if($player['playerID'] == $_SESSION['playerID']){
            $meFound = true;
            break;
        }
    }

    if($meFound == true){
        if ($arr['roomStatus'] != 2) {
            $myColor = null;
            $endGame = false;
            $newLeaderBoard = null;
            $newPawnData = null;
    
            foreach ($data as $player) {
                if ($player['playerID'] == $_SESSION['playerID']) {
                    $myColor = $player['color'];
                }
            }
            
            $time = round(microtime(true) * 1000) + $roundTime;
            $newCurrentPlayer = null;

            if($arr['lastThrow'] != null){
                $lastThrow = json_decode($arr['lastThrow'], true);
            } else {
                $lastThrow = null;
            }

            if ($time - $arr['roundTime'] > $roundTime && $arr['roomStatus'] == 1) {
                $arr['roundTime'] = $time;
                for ($i = 0; $i < count($data); $i++) {
                    if ($data[$i]['playerID'] == $arr['currentPlayer']) {

                        if($lastThrow != null){
                            if($lastThrow['playerID'] != $arr['currentPlayer']){
                                $data[$i]['skipTurnCount'] = $data[$i]['skipTurnCount'] + 1;
                            } else {
                                $data[$i]['skipTurnCount'] = 0;
                            }
                        } else {
                            $data[$i]['skipTurnCount'] = $data[$i]['skipTurnCount'] + 1;
                        }

                        for ($j = 1; $j < count($data); $j++) {
                            if ($data[($i + $j) % count($data)]['status'] == 2 && $data[($i + $j) % count($data)]['skipTurnCount'] < $skipTurnsToKick) {
                                $arr['currentPlayer'] = $data[($i + $j) % count($data)]['playerID'];
                                $newCurrentPlayer = $data[($i + $j) % count($data)]['playerID'];
                                break;
                            }
                        }
                        break;
                    }
                }

                if($arr['leaderBoard'] == null){
                    $leaderBoard = [];
                } else {
                    $leaderBoard = json_decode($arr['leaderBoard'], true);
                }

                $pawnData = json_decode($arr['pawnData'], true);

                for($i = count($data) - 1; $i >= 0 ; $i--){
                    if($data[$i]['skipTurnCount'] >= $skipTurnsToKick){
                        for($j = count($pawnData) - 1; $j >= 0; $j--){
                            if($pawnData[$j]['playerID'] == $data[$i]['playerID']){
                                array_splice($pawnData, $j, 1);
                                break;
                            }
                        }
                        array_splice($data, $i, 1);
                        $arr['playerCount'] = $arr['playerCount'] - 1;
                    }
                }
                $stillPlay = 0;

                for($i = 0; $i < count($data); $i++){
                    if($data[$i]['status'] == 2){
                        $stillPlay++;
                    }
                }

                if($stillPlay < 2){
                    $endGame = true;
                    for($i = 0; $i < count($data); $i++){
                        if($data[$i]['status'] == 2){
                            $data[$i]['status'] = 3;
                            array_push($leaderBoard, [
                                "nick" => $data[$i]['nick'],
                                "color" => $data[$i]['color']
                            ]);
                        }
                    }

                    $newPawnData = json_encode($pawnData);
                    $newLeaderBoard = json_encode($leaderBoard);
                    $newRoomStatus = 2;

                    $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.roomStatus = ?, room_data.leaderBoard = ?, room_data.pawnData = ? WHERE room_data.roomID = ?");
                    mysqli_stmt_bind_param($stmt, "isss", $newRoomStatus, $newLeaderBoard, $newPawnData, $roomID);
                    mysqli_stmt_execute($stmt);
                }

    
                $nullVal = null;
                $newPlayerCount = $arr['playerCount'];
                $newData = json_encode($data);
                $newPawnData = json_encode($pawnData);

                if($newCurrentPlayer != null ){
                    $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.playerCount = ?, room_data.currentPlayer = ?, room_data.roundTime = ?, room_data.lastThrow = ?, room_data.data = ?, room_data.pawnData = ? WHERE room_data.roomID = ?");
                    mysqli_stmt_bind_param($stmt, "isissss", $newPlayerCount, $newCurrentPlayer, $time, $nullVal, $newData, $newPawnData, $roomID);
                    mysqli_stmt_execute($stmt);
                } else {
                    $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.playerCount = ?, room_data.data = ?, room_data.pawnData = ? WHERE room_data.roomID = ?");
                    mysqli_stmt_bind_param($stmt, "isss", $newPlayerCount, $newData, $newPawnData, $roomID);
                    mysqli_stmt_execute($stmt);
                }
            }
    
            $myTurn = ($newCurrentPlayer == null) ? ($arr['currentPlayer'] == $_SESSION['playerID']) : ($newCurrentPlayer == $_SESSION['playerID']);
    
            if (isset($arr['lastThrow'])) {
                $lastThrow = json_decode($arr['lastThrow'], true);
            } else {
                $lastThrow = null;
            }
    
            if ($myTurn == true) {
                $needThrow = ($lastThrow != null) ? ($lastThrow['playerID'] != $_SESSION['playerID']) : true;
            } else {
                $needThrow = false;
            }

            if($endGame == true){

                $meFound = false;
                foreach($data as $player){
                    if($player['playerID'] == $_SESSION['playerID']){
                        $meFound = true;
                        break;
                    }
                }

                if($meFound == true){
                    $myColor = null;
        
                    foreach($data as $player){
                        if($player['playerID'] == $_SESSION['playerID']){
                            $myColor = $player['color'];
                        }
                    }
                    $leaderBoard = $newLeaderBoard;
            
                    echo json_encode((object)[
                        "status" => true,
                        "endGame" => true,
                        "myColor" => $myColor,
                        "leaderBoard" => $leaderBoard
                    ]);
                } else {
                    echo json_encode((object)[
                        "status" => false
                    ]);
                }
            } else {
                $currentTime = round(microtime(true) * 1000);
        
                unset($arr['ID']);
                unset($arr['roomID']);
                echo json_encode((object)[
                    "status" => true,
                    "baseData" => $arr,
                    "myColor" => $myColor,
                    "myTurn" => $myTurn,
                    "needThrow" => $needThrow,
                    "currentTime" => $currentTime,
                    "endGame" => false
                ]);
            }
    
        } else {
    
            $myColor = null;
    
            foreach($data as $player){
                if($player['playerID'] == $_SESSION['playerID']){
                    $myColor = $player['color'];
                }
            }
            $leaderBoard = $arr['leaderBoard'];
    
            echo json_encode((object)[
                "status" => true,
                "endGame" => true,
                "myColor" => $myColor,
                "leaderBoard" => $leaderBoard
            ]);
        }
    } else {
        echo json_encode((object)[
            "status" => false
        ]);
    }
} else {
    echo json_encode((object)[
        "status" => false
    ]);
}
