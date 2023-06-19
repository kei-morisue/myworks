<!DOCTYPE html>

<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>My Works</title>
    <link rel="icon" href="./img/icon-512x512.png">
    <!-- CSS-->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css">
    <link rel="stylesheet" type="text/css"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick-theme.css">
    <link rel="stylesheet" href="./css/slick.css">
    <!-- js -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>

    <script type="module" src="./js/main.js"></script>
</head>

<body style="background:black">

    <div>
        <span class="title">
            <b>My Works and Crease Patterns</b>
        </span>
    </div>
    <label for="select" class="name">Year</label>
    <select id="select">
        <option value="all">all</option>
        <option value="2011">2010</option>
        <option value="sample">2011</option>
        <option value="sample">2022</option>
        <option value="sample">2023</option>

    </select>

    <?php include("./list_all.php"); ?>
    <?php include("./cp.php"); ?>

    <div class="console">
        <iframe id="doc" frameborder="0"></iframe>
    </div>



</body>

</html>