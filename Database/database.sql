-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 02 Cze 2022, 14:57
-- Wersja serwera: 10.4.17-MariaDB
-- Wersja PHP: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `chinczyk`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `room_data`
--

CREATE TABLE `room_data` (
  `ID` int(11) NOT NULL,
  `roomID` varchar(13) COLLATE utf8_polish_ci NOT NULL,
  `privateRoom` tinyint(1) NOT NULL,
  `inviteCode` varchar(13) COLLATE utf8_polish_ci NOT NULL,
  `roomStatus` int(11) NOT NULL,
  `playerCount` int(11) NOT NULL,
  `roundTime` bigint(20) DEFAULT NULL,
  `currentPlayer` varchar(20) COLLATE utf8_polish_ci DEFAULT NULL,
  `lastThrow` text COLLATE utf8_polish_ci DEFAULT NULL,
  `leaderBoard` text COLLATE utf8_polish_ci DEFAULT NULL,
  `data` text COLLATE utf8_polish_ci NOT NULL,
  `pawnData` text COLLATE utf8_polish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `room_data`
--
ALTER TABLE `room_data`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT dla zrzuconych tabel
--

--
-- AUTO_INCREMENT dla tabeli `room_data`
--
ALTER TABLE `room_data`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
