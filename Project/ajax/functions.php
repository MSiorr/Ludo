<?php

include('config.php');

function checkMove($arr, $pawnObj, $id, $lastThrowObj = null) {
    global $C_pawnEnterBase;
    global $C_boardSize;
    global $C_pawnStart;

    $myPawns = null;
    $moveExecuted = false;
    if($lastThrowObj == null){
        $lastThrow = json_decode($arr['lastThrow'], true);
    } else {
        $lastThrow = json_decode($lastThrowObj, true);
    }


    $myPawns = $pawnObj;
    $onePawn = explode('_', $myPawns['pawnPlace'][$id]);
    $newPawn = null; 
    switch ($onePawn[0]) {
        case "HOME": {
                if ($lastThrow['value'] == 1 || $lastThrow['value'] == 6) {
                    $newPawn = "PATH_" . $C_pawnStart[$onePawn[1][0]];
                    $moveExecuted = true;
                }
                break;
            }
        case "PATH": {
                $enterBase = false;
                $moveExecuted = true;
                $colorSign = strtoupper($pawnObj['color'][0]);

                $newPos = $onePawn[1] + $lastThrow['value'];

                if ($onePawn[1] <= $C_pawnEnterBase[$colorSign] && $newPos > $C_pawnEnterBase[$colorSign]) {
                    $newPos = $newPos - $C_pawnEnterBase[$colorSign];
                    $enterBase = true;
                    if ($newPos > 4) {
                        $moveExecuted = false;
                    }
                }

                if ($newPos > $C_boardSize && $enterBase == false) {
                    $newPos = $newPos - $C_boardSize;
                }

                if ($enterBase == false) {
                    $newPawn = "PATH_" . $newPos;

                } else {
                    $newPawn = "BASE_" . $colorSign . $newPos;
                    if (in_array($newPawn, $myPawns['pawnPlace'])) {
                        $moveExecuted = false;
                    }
                }

                break;
            }
        case "BASE": {
                $pawnCurrPos = substr($onePawn[1], 1);
                $newPosition = $lastThrow['value'] + $pawnCurrPos;
                if ($newPosition > 4) {
                    $moveExecuted = false;
                } else {
                    $newPawn = "BASE_" . $onePawn[1][0] . $newPosition;
                    $moveExecuted = true;
                }
                if (in_array($newPawn, $myPawns['pawnPlace'])) {
                    $moveExecuted = false;
                }
                break;
            }
        default: {
                break;
            }
    }
    if($moveExecuted == true){
        return [
            "canMove" => true,
            "newPawn" => $newPawn
        ];
    } else {
        return [
            "canMove" => false
        ];
    }
}
