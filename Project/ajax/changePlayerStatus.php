<?php

    session_start();

    include('config.php');
    $mysqli = mysqli_connect($host, $user, $passwd, $db);
    mysqli_query($mysqli, "set names utf8");

    $roomID = $_SESSION['roomID'];
    $playerID = $_SESSION['playerID'];

    $res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE roomID = '$roomID'");
    $arr = mysqli_fetch_assoc($res);

    $data = json_decode($arr["data"], true);
    $startGame = true;

    for($i = 0; $i < count($data); $i++){
        if($data[$i]["playerID"] == $playerID){
            $data[$i]["status"] = (int)$_POST["status"];
        }
        if($data[$i]["status"] == 0){
            $startGame = false;
        }
    }

    if(count($data) > 1 && $startGame){
        $roomStatus = 1;
        for($i = 0; $i < count($data); $i++){
            $data[$i]["status"] = 2;
        }
    } else {
        $roomStatus = 0;
    }
    
    
    $newData = json_encode($data, JSON_UNESCAPED_UNICODE);
    if($roomStatus == 0){
        $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.data = ? WHERE room_data.roomID = ?");
        mysqli_stmt_bind_param($stmt, "ss", $newData, $roomID);
        mysqli_stmt_execute($stmt);
    
        echo json_encode((object)[
            "startGame" => false
        ]);
    } else {
        $currentPlayer = $data[0]["playerID"];
        $time = round(microtime(true) * 1000) + $roundTime;

        $pawnData = [];
        foreach($data as $player){
            array_push($pawnData, (array)[
                "playerID" => $player['playerID'],
                "pawnPlace" => [
                        "HOME_".strtoupper($player['color'][0])."1",
                        "HOME_".strtoupper($player['color'][0])."2",
                        "HOME_".strtoupper($player['color'][0])."3",
                        "HOME_".strtoupper($player['color'][0])."4",
                ],
                "color" => $player['color']
            ]);
        }

        $newPawnData = json_encode($pawnData, JSON_UNESCAPED_UNICODE);
        

        $stmt = mysqli_prepare($mysqli, "UPDATE room_data SET room_data.data = ?, room_data.roomStatus = ?, room_data.roundTime = ?, room_data.currentPlayer = ?, room_data.pawnData = ? WHERE room_data.roomID = ?");
        mysqli_stmt_bind_param($stmt, "siisss", $newData, $roomStatus, $time, $currentPlayer, $newPawnData, $roomID);
        mysqli_stmt_execute($stmt);
    
        echo json_encode((object)[
            "startGame" => true,
            "pawnData" => $newPawnData
        ]);
    }


?>