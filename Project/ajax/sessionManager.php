<?php

session_start();

include('config.php');
include('functions.php');
$mysqli = mysqli_connect($host, $user, $passwd, $db);
mysqli_query($mysqli, "set names utf8");

if (isset($_SESSION["roomID"]) == false || (isset($_POST['restart']) && $_POST['restart'] == true)) {
    sendNewSession();
} else {
    $roomID = $_SESSION['roomID'];
    $res = mysqli_query($mysqli, "SELECT * FROM room_data WHERE roomID = '$roomID'");
    $arr = mysqli_fetch_assoc($res);

    if ($arr != null) {
        $playersData = json_decode($arr['data'], true);
        if (count($playersData) <= 0) {
            sendNewSession();
        } else {

            $nick = null;
            $color = null;
            $myTurn = ($arr['currentPlayer'] == $_SESSION['playerID']);
            $pawnsToMove = [];

            if ($myTurn == true) {
                if($arr['lastThrow'] != null){
                    $lastThrowData = json_decode($arr['lastThrow'], true);
                } else {
                    $lastThrowData = null;
                }
                if ($lastThrowData != null && $lastThrowData['playerID'] == $_SESSION['playerID']) {
                    $pawnData = json_decode($arr['pawnData'], true);
                    foreach ($pawnData as $pDat) {
                        if ($pDat['playerID'] == $_SESSION['playerID']) {
                            for ($i = 0; $i < count($pDat['pawnPlace']); $i++) {
                                $moveStatus = checkMove($arr, $pDat, $i);
                                array_push($pawnsToMove, [
                                    "pawn" => $pDat['pawnPlace'][$i],
                                    "canMove" => $moveStatus['canMove'],
                                    "futurePawn" => (isset($moveStatus['newPawn'])) ? $moveStatus['newPawn'] : null
                                ]);
                            }
                        }
                    }
                }
            }


            foreach ($playersData as $player) {
                if ($_SESSION["playerID"] == $player['playerID']) {
                    $nick = $player['nick'];
                    $color = $player['color'];
                    echo json_encode((object)[
                        "data" => $playersData,
                        "roomStatus" => $arr['roomStatus'],
                        "myNick" => $nick,
                        "myColor" => $color,
                        "currentPlayer" => $arr['currentPlayer'],
                        "myTurn" => $myTurn,
                        "roundTime" => $arr['roundTime'],
                        "pawnsToMove" => $pawnsToMove,
                        "privateRoom" => boolval($arr['privateRoom']),
                        "inviteCode" => $arr['inviteCode']
                    ]);
                }
            }

            if ($nick == null || $color == null) {
                sendNewSession();
            }
        }
    } else {
        sendNewSession();
    }
}

$removeTime = round(microtime(true) * 1000) - $timeToRoomRemove;

$stmt = mysqli_prepare($mysqli, "DELETE FROM room_data WHERE roundTime < ?");
mysqli_stmt_bind_param($stmt, "i", $removeTime);
mysqli_stmt_execute($stmt);

function sendNewSession()
{
    session_destroy();
    session_start();

    $res = (object)[
        'newSession' => true
    ];
    echo json_encode($res);
}
