<?php
$array = array();
$array["files"] = glob($_POST['pattern']);



$array["contents"] = file($array["files"][0]);
echo json_encode($array);
?>