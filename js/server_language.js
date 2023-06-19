import { IO } from "./flatfolder/io.js"
import { SVG } from "./flatfolder/svg.js"
import { GUI } from "./flatfolder/gui.js"
export const SL = {
    set_slick: ($items) => {
        $items.slick(
            {
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                centerMode: true,
                centerPadding: "20%",
                dots: true,
                arrows: true,
            }
        );
    },

    set_xsr: (fd, par, id_num) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', './php/XHR_POST_receiver.php', true);
        xhr.responseType = "json";

        const area = document.createElement("div")
        area.setAttribute("class", "slide-area")
        const slick = document.createElement("ul")
        slick.setAttribute("class", "slide-items")
        slick.setAttribute("id", "slide_items_" + id_num)
        xhr.addEventListener('load', function (event) {
            const images = xhr.response.files
            images.map((i) => {
                const image = document.createElement('img');
                image.src = i
                const li = document.createElement("li")
                li.appendChild(image)
                slick.appendChild(li)

            })
            area.appendChild(slick)
            par.appendChild(area)
            SL.set_slick($("#" + "slide_items_" + id_num))
        });
        xhr.send(fd)
    },

    set_cps: (fd, doc, par, id_num) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', './php/receivetext.php', true);
        xhr.responseType = "json";

        xhr.addEventListener('load', function (event) {
            const path = xhr.response.files[0]
            if (path == undefined) {
                return
            }
            const doc = xhr.response.contents.join("")

            const FOLD = IO.doc_2_FOLD(doc, "cp")
            const svg = SVG.draw_canvas("flat_" + id_num, par)
            svg.setAttribute("class", "cp-area")
            GUI.update_flat(svg, FOLD)

        });
        xhr.send(fd)
    },
    set_names: (fd) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', './php/receive_dir.php', true);
        xhr.responseType = "json";

        xhr.addEventListener('load', function (event) {
            let names = xhr.response.files
            let fd = new FormData();
            const all = document.getElementById("list_all")
            names = names.map((i) => {
                const splitted = i.split("/")
                return splitted[splitted.length - 1]
            })
            for (const [i, v] of names.entries()) {
                const par = document.createElement("div")
                par.setAttribute("class", "model-area")
                par.setAttribute("id", "model-area_" + i)
                all.appendChild(par)

                const model_name = document.createElement("b")
                model_name.textContent = v.replace("_", " ")
                model_name.setAttribute("class", "title")
                par.appendChild(model_name)


                fd.append("pattern", "../gallery/" + v + "/*.txt");
                SL.set_cps(fd, document.getElementById("doc"), par, i);

                fd.append("pattern", "../gallery/" + v + "/*.jpg");
                SL.set_xsr(fd, par, i);
            }

        });
        xhr.send(fd)
    }

}