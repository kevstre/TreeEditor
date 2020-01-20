"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = require("./modules/d3");
const script_1 = require("./script");
function openNav() {
    let current = d3.select(this);
    let parent = d3.select(this.parentNode);
    let id = parent.attr("id");
    script_1.resetListeners();
    document.getElementById("mySidebar").style.width = "335px";
    document.getElementById('rectInfo').innerHTML = id;
    let titleText = document.getElementById("titleText");
    let contentText = document.getElementById("contentText");
    let colorPicker = document.getElementById("colorPicker");
    d3.select("#colorPickerBtn").style("background", current.attr("fill"));
    titleText.value = parent.select("text.titleText").text();
    contentText.value = parent.select("text.contentText").text();
    colorPicker.value = current.attr("fill");
    listFiles(id);
    script_1.resetRectBorder();
    d3.select(this)
        .style("stroke", "red")
        .on("dblclick", closeNav);
    d3.select(".closebtn").on("click", function () {
        closeNav();
    });
}
exports.openNav = openNav;
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById('rectInfo').innerHTML = "";
    let titleText = document.getElementById("titleText");
    let contentText = document.getElementById("contentText");
    titleText.value = "";
    contentText.value = "";
    script_1.resetRectBorder();
    script_1.resetListeners();
}
function listFiles(id) {
    let entries = d3.select("#fileList").selectAll("li");
    entries.each(function () {
        let li = d3.select(this);
        if (li.attr("id").slice(0, 1) == id) {
            li.style("display", 'inherit');
        }
        else {
            li.style("display", 'none');
        }
    });
}
function processLinkItem() {
    let name = document.getElementById("linkName");
    let url = document.getElementById("linkVal");
    if (validURL(url.value)) {
        updateLinkList(name.value, url.value);
    }
}
exports.processLinkItem = processLinkItem;
function validURL(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
    return !!pattern.test(str);
}
function updateLinkList(name, url) {
    let id = document.getElementById('rectInfo').innerHTML;
    let ul = document.getElementById("linkList");
    let entries = d3.select("#linkList").selectAll("li");
    let isDuplicate = false;
    entries.each(function () {
        let str = this.textContent.slice(0, -1);
        if (str == name) {
            isDuplicate = true;
        }
    });
    if (!isDuplicate) {
        let li = document.createElement("li");
        let span = document.createElement("span");
        li.appendChild(document.createTextNode(name));
        li.setAttribute("class", id);
        span.insertAdjacentHTML('beforeend', `<a class="deleteBtn"><i class="fa fa-times"></i></a>`);
        span.insertAdjacentHTML('beforeend', `<a href=${url} class="linkBtn"><i class="fa fa-external-link"></i></a>`);
        li.appendChild(span);
        ul.appendChild(li);
    }
}
function appendLinkItem() {
}
