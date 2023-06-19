<?php
$array = array();

$array["files"] = glob($_POST['pattern'], GLOB_ONLYDIR);

echo json_encode($array);
?>