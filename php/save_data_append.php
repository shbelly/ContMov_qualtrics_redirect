#!/usr/local/bin/php
<?php
// the $_POST[] array will contain the passed in filename and filedata
// the directory "data" must be writable by the server
error_reporting(E_ALL);
ini_set('display_errors', 1);
$filename = "../data/".$_POST['filename'];
$data = $_POST['filedata'];
// write the file to disk
file_put_contents($filename, $data, FILE_APPEND);
?>
