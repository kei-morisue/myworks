import { SL } from "./server_language.js"





let fd = new FormData();
fd.append("pattern", "../gallery/*");
SL.set_names(fd);



