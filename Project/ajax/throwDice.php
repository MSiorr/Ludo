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
        $lastThrowPID = null;
        if($arr['lastThrow'] != null){
            $lastThrow = json_decode($arr['lastThrow'], true);
            $lastThrowPID = $lastThrow['playerID'];
        }
        if($playerID == $arr['currentPlayer'] && $time - $arr['roundTime'] < $roundTime &&($lastThrowPID == null || $playerID != $lastThrowPID)){
            $diceVal = rand(1,6);

            $myColor;

            $data = json_decode($arr['data'],  true);
            foreach($data as $player){
                if($player['playerID'] == $playerID){
                    $myColor = $player['color'];
                }
            }

            
            $lastThrow = json_encode((object)[
                "playerID" => $playerID,
                "value" => $diceVal,
                "color" => $myColor
            ]);
                
            $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.lastThrow = ? WHERE room_data.roomID = ?");
            mysqli_stmt_bind_param($stmt, "ss", $lastThrow, $roomID);
            mysqli_stmt_execute($stmt);
            
            $pawnsToMove = [];
            $oneCanMove = false;

            $pawnData = json_decode($arr['pawnData'],true);
            foreach($pawnData as $pDat){
                if($pDat['playerID'] == $playerID){
                    for($i = 0; $i < count($pDat['pawnPlace']); $i++){
                        $moveStatus = checkMove($arr, $pDat, $i, $lastThrow);
                        array_push($pawnsToMove, [
                            "pawn" => $pDat['pawnPlace'][$i],
                            "canMove" => $moveStatus['canMove'],
                            "futurePawn" => (isset($moveStatus['newPawn'])) ? $moveStatus['newPawn'] : null
                        ]);
                        if($moveStatus['canMove'] == true){
                            $oneCanMove = true;
                        }
                    }
                }
            }

            if($oneCanMove == true) {
                $pawnsToMove = json_encode($pawnsToMove);
                echo json_encode((object)[
                    "status" => true,
                    "moveStatus" => true,
                    "diceValue" => $diceVal,
                    "myColor" => $myColor,
                    "pawnsToMove" => $pawnsToMove
                ]);
            } else {
                echo json_encode((object)[
                    "status" => true,
                    "moveStatus" => false,
                    "diceValue" => $diceVal,
                    "myColor" => $myColor,
                ]);

                $time = round(microtime(true) * 1000) + $noMoveTime;

                if($time < $arr['roundTime']){
                    $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.roundTime = ? WHERE room_data.roomID = ?");
                    mysqli_stmt_bind_param($stmt, "is", $time, $roomID);
                    mysqli_stmt_execute($stmt);
                }
            }
        } else {
            echo json_encode((object)[
                "status" => false
            ]);
        }
    }
