<?php

    session_start();

    include('config.php');
    $mysqli = mysqli_connect($host, $user, $passwd, $db);
    mysqli_query($mysqli, "set names utf8");

    $removeTime = round(microtime(true) * 1000) - $timeToRoomRemove;

    $stmt = mysqli_prepare($mysqli, "DELETE FROM room_data WHERE roundTime < ?");
    mysqli_stmt_bind_param($stmt, "i", $removeTime);
    mysqli_stmt_execute($stmt);

    $res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE privateRoom=0 AND roomStatus=0 AND playerCount < 4 ORDER BY ID");
    $arr = mysqli_fetch_all($res, MYSQLI_ASSOC);

    if(count($arr) > 0){

        $roomsData = [];
        foreach($arr as $room){
            array_push($roomsData, [
                "inviteCode" => $room['inviteCode'],
                "playerCount" => $room['playerCount']
            ]);
        }

        echo json_encode([
            "status" => true,
            "rooms" =>  json_encode($roomsData)
        ]);
    } else {
        echo json_encode([
            "status" => false
        ]);
    }
?>