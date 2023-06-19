<?php
$array = array();

$array["files"] = glob($_POST['pattern']);

echo json_encode($array);
?>