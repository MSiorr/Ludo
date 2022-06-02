<?php

    session_start();

    include('config.php');
    include('functions.php');
    $mysqli = mysqli_connect($host, $user, $passwd, $db);
    mysqli_query($mysqli, "set names utf8");

    $roomID = $_SESSION['roomID'];
    $playerID = $_SESSION['playerID'];
    $res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE roomID = '$roomID'");
    $arr = mysqli_fetch_assoc($res);

    if($arr != null){
        $time = round(microtime(true) * 1000) + $roundTime;
        if($playerID == $arr['currentPlayer'] && $time - $arr['roundTime'] < $roundTime){
            $moveExecuted = false;

            $data = json_decode($arr['data'],  true);
            $newCurrentPlayer = null;

            for($i = 0; $i < count($data); $i++){
                if($data[$i]['playerID'] == $arr['currentPlayer']){
                    for($j = 1; $j < count($data); $j++){
                        if($data[($i+$j) % count($data)]['status'] == 2){
                            $newCurrentPlayer = $data[($i+$j) % count($data)]['playerID'];
                            break;
                        }
                    }
                    break;
                }
            }

            
            if(isset($_POST['pawnID'])){
                $moveStatus;
                $endForPlayer = true;

                for($i = 0; $i < count($data); $i++){
                    if($data[$i]['playerID'] == $arr['currentPlayer']){
                        $data[$i]['skipTurnCount'] = 0;

                        $newData = json_encode($data);

                        $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.data = ? WHERE room_data.roomID = ?");
                        mysqli_stmt_bind_param($stmt, "ss", $newData, $roomID);
                        mysqli_stmt_execute($stmt);

                        break;
                    }
                }

                $pawnData = json_decode($arr['pawnData'], true);
                for($i = 0; $i < count($pawnData); $i++){
                    if($pawnData[$i]['playerID'] == $playerID){
                        $moveStatus = checkMove($arr, $pawnData[$i], $_POST['pawnID']);

                        if($moveStatus["canMove"] == true){
                            $pawnData[$i]['pawnPlace'][$_POST['pawnID']] = $moveStatus['newPawn'];

                            // ZBIJANIE

                            for ($j = 0; $j < count($pawnData); $j++) {
                                if ($pawnData[$j]['playerID'] != $playerID) {
                                    for ($k = 0; $k < count($pawnData[$j]['pawnPlace']); $k++) {
                                        if ($pawnData[$j]['pawnPlace'][$k] == $moveStatus['newPawn']) {
                                            $string = "HOME_" . strtoupper($pawnData[$j]['color'][0]) . ($k + 1);
                                            $pawnData[$j]['pawnPlace'][$k] = $string;
                                        }
                                    }
                                }
                            }

                            // SPRAWDZENIE CZY SKOŃCZYŁ

                            for ($j = 0; $j < count($pawnData[$i]['pawnPlace']); $j++) {
                                $pawnInfo = explode('_', $pawnData[$i]['pawnPlace'][$j]); 
                                if($pawnInfo[0] != "BASE"){
                                    $endForPlayer = false;
                                }
                            }
                        }
                        break;
                    }
                }

                if($moveStatus["canMove"] == true){
                    $newPawnData = json_encode($pawnData);
                    $roomStatus = $arr['roomStatus'];
                    if($arr['leaderBoard'] == null){
                        $leaderBoard = [];
                    } else {
                        $leaderBoard = json_decode($arr['leaderBoard'], true);
                    }

                    if($endForPlayer == true){
                        $stillPlay = 0;

                        
                        
                        for($i = 0; $i < count($data); $i++){
                            if($data[$i]['playerID'] == $playerID){
                                $data[$i]['status'] = 3;
                                array_push($leaderBoard, [
                                    "nick" => $data[$i]['nick'],
                                    "color" => $data[$i]['color']
                                ]);
                            } else {
                                if($data[$i]['status'] == 2){
                                    $stillPlay++;
                                }
                            }
                        }
                        
                        if($stillPlay < 2){
                            $roomStatus = 2;
                            $newCurrentPlayer = null;
                            for($i = 0; $i < count($data); $i++){
                                if($data[$i]['status'] == 2){
                                    $data[$i]['status'] = 3;
                                    array_push($leaderBoard, [
                                        "nick" => $data[$i]['nick'],
                                        "color" => $data[$i]['color']
                                    ]);
                                }
                            }
                        }
                        $newData = json_encode($data);
                        $newLeaderBoard = json_encode($leaderBoard);

                        $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.currentPlayer = ?, room_data.roundTime = ?, room_data.pawnData = ?, room_data.data = ?, room_data.leaderBoard = ?, room_data.roomStatus = ? WHERE room_data.roomID = ?");
                        mysqli_stmt_bind_param($stmt, "sisssis", $newCurrentPlayer, $time, $newPawnData, $newData, $newLeaderBoard, $roomStatus, $roomID);
                        mysqli_stmt_execute($stmt);

                    } else {
                        $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.currentPlayer = ?, room_data.roundTime = ?, room_data.pawnData = ? WHERE room_data.roomID = ?");
                        mysqli_stmt_bind_param($stmt, "siss", $newCurrentPlayer, $time, $newPawnData, $roomID);
                        mysqli_stmt_execute($stmt);
                    }

                    if($roomStatus == 2){

                        $myColor = null;

                        foreach($data as $player){
                            if($player['playerID'] == $_SESSION['playerID']){
                                $myColor = $player['color'];
                            }
                        }

                        echo json_encode((object)[
                            "status" => true,
                            "pawnData" => $newPawnData,
                            "endGame" => true,
                            "myColor" => $myColor,
                            "leaderBoard" => json_encode($leaderBoard)
                        ]);
                    } else {
                        echo json_encode((object)[
                            "status" => true,
                            "pawnData" => $newPawnData,
                            "endGame" => false
                        ]);
                    }
                    
                } else {
                    echo json_encode((object)[
                        "status" => false
                    ]);
                }
            }
        } else {
            echo json_encode((object)[
                "status" => false
            ]);
        }
    }
?>