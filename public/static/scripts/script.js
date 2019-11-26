"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = require("./modules/d3.js");
let toJSON = require("./modules/toJSON.js");
let toDOM = require("./modules/toDOM.js");
let svg, graph, boundaries, margin, height, width, nodes, g, rect, dragRect, dragBorder, line, deltaX, deltaY, deltaXBorder, deltaYBorder, rectWidth, rectHeight;
window.onload = () => {
    initializePage();
    loadProject();
    defineGrid();
};
function defineGrid() {
    let tickAmount = 70;
    let grid = svg.append("g")
        .attr("id", "grid")
        .attr("pointer-events", "none");
    let xScale = d3.scaleLinear()
        .range([0, boundaries.width - margin.left - margin.right]);
    let xAxis = d3.axisBottom()
        .ticks(tickAmount)
        .scale(xScale);
    grid.append("g")
        .attr("class", "xGridAxis")
        .call(xAxis);
    let xGridLines = d3.axisBottom()
        .tickFormat("")
        .ticks(tickAmount)
        .tickSize(boundaries.height - margin.top - margin.bottom)
        .scale(xScale);
    grid.append("g")
        .attr("class", "xGridLines")
        .call(xGridLines);
    let yScale = d3.scaleLinear()
        .range([0, boundaries.height - margin.top - margin.bottom]);
    let yAxis = d3.axisRight()
        .ticks(tickAmount)
        .scale(yScale);
    grid.append("g")
        .attr("class", "yGridAxis")
        .call(yAxis);
    let yGridLines = d3.axisRight()
        .tickFormat("")
        .ticks(tickAmount)
        .tickSize(boundaries.width - margin.left - margin.right)
        .scale(yScale);
    grid.append("g")
        .attr("class", "yGridLines")
        .call(yGridLines);
}
function initializePage() {
    margin = { top: 20, right: 20, bottom: 20, left: 20 };
    graph = document.getElementById('main');
    boundaries = graph.getBoundingClientRect();
    width = boundaries.width - margin.left - margin.right;
    height = boundaries.height - margin.top - margin.bottom;
    svg = d3.select("#graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .on("mousedown", mousedown)
        .on("mouseup", mouseUp);
    nodes = svg.append("g").attr("id", "nodes");
    dragRect = d3.drag()
        .on("start", dragStart)
        .on("drag", dragMove);
    dragBorder = d3.drag()
        .on("start", dragStartBorder)
        .on("drag", dragMoveBorder);
    d3.select(".closebtn").on("click", function () {
        closeNav();
    });
    d3.select("#titleText").on("input", function () {
        updateRectText(this);
    });
    d3.select("#contentText").on("input", function () {
        updateRectText(this);
    });
    d3.select("#colorPicker").on("input", function () {
        updateRectColor(this);
    });
    d3.select("#fileChooserBtn").on("click", function () {
        document.getElementById("fileChooser").click();
    });
    d3.select("#fileChooser").on("input", function () {
        uploadFile();
    });
    d3.select("#saveButton").on("click", function () {
        saveProject();
    });
}
function mousedown() {
    if (d3.event.button != 2) {
        let event = d3.mouse(this);
        let rectCounter = 1;
        svg.selectAll("rect").each(function () {
            let id = +d3.select(this.parentNode).attr("id");
            console.log(id);
            if (id >= rectCounter) {
                rectCounter = id + 1;
            }
        });
        g = nodes.append("g")
            .attr("id", rectCounter)
            .call(dragRect);
        rect = g.append("rect")
            .attr("x", event[0] + 5)
            .attr("y", event[1] + 5)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr('height', 0)
            .attr('width', 0)
            .attr("fill", "#aaa9ad")
            .style("stroke-width", 5)
            .style("stroke", "#7b9eb4")
            .attr("class", "rect");
        initializeRectListeners();
        g.append("circle")
            .attr("cx", (+rect.attr("x") + (+rect.attr("width") / 2)))
            .attr("cy", +rect.attr("y"))
            .attr("r", 5)
            .attr("id", "circleTop" + rectCounter)
            .attr("class", "circle")
            .attr("fill", "grey");
        g.append("circle")
            .attr("cx", (+rect.attr("x") + (+rect.attr("width") / 2)))
            .attr("cy", (+rect.attr("y") + +rect.attr("height")))
            .attr("r", 5)
            .attr("id", "circleBottom" + rectCounter)
            .attr("class", "circle")
            .attr("fill", "grey");
        g.append("circle")
            .attr("cx", +rect.attr("x"))
            .attr("cy", (+rect.attr("y") + (+rect.attr("height") / 2)))
            .attr("r", 5)
            .attr("id", "circleLeft" + rectCounter)
            .attr("class", "circle")
            .attr("fill", "grey");
        g.append("circle")
            .attr("cx", (+rect.attr("x") + +rect.attr("width")))
            .attr("cy", (+rect.attr("y") + (+rect.attr("height") / 2)))
            .attr("r", 5)
            .attr("id", "circleRight" + rectCounter)
            .attr("class", "circle")
            .attr("fill", "grey");
        g.append("circle")
            .attr("cx", (+rect.attr("x") + +rect.attr("width")))
            .attr("cy", (+rect.attr("y") + (+rect.attr("height"))))
            .attr("r", 4)
            .attr("id", "circleBottomRight" + rectCounter)
            .attr("class", "circle")
            .attr("fill", "#7b9eb4");
        initializeCircleListeners();
        svg.on("mousemove", mouseMove);
    }
}
function initializeRectListeners() {
    let rect = d3.selectAll("rect");
    rect.on("mouseover", function () {
        d3.select(this)
            .style("cursor", "grabbing");
    })
        .on("mouseout", function () {
        d3.select(this)
            .style("cursor", "default");
    })
        .on("dblclick", openNav)
        .call(dragRect);
}
function initializeCircleListeners() {
    let count = null;
    svg.selectAll("rect").each(function () {
        count = +d3.select(this.parentNode).attr("id");
        d3.select(`#circleBottomRight${count}`)
            .on("mouseover", function () {
            d3.select(this)
                .style("cursor", "se-resize");
        })
            .on("mouseout", function () {
            d3.select(this)
                .style("cursor", "default");
        })
            .call(dragBorder);
        d3.selectAll(`#circleRight${count}, #circleLeft${count}, #circleTop${count}, #circleBottom${count}`)
            .on('mouseover', function () {
            d3.select(this)
                .attr("r", 10)
                .style("cursor", "crosshair");
        })
            .on('mouseout', function () {
            d3.select(this)
                .attr("r", 5)
                .style("cursor", "default");
        })
            .on("click", drawLine);
    });
}
function mouseMove() {
    let rectCounter = 1;
    svg.selectAll("rect").each(function () {
        let id = +d3.select(this.parentNode).attr("id");
        if (id >= rectCounter) {
            rectCounter = id;
        }
    });
    let event = d3.mouse(this), newXCoordinate = Math.max(0, event[0] - +rect.attr("x")), newYCoordinate = Math.max(0, event[1] - +rect.attr("y"));
    updateRectSize(newXCoordinate, newYCoordinate, rectCounter, null, rect, true);
}
function dragStart() {
    let current = d3.select(this);
    let tagName = current.node().tagName;
    if (tagName === "rect") {
        deltaX = current.attr("x") - d3.event.x;
        deltaY = current.attr("y") - d3.event.y;
    }
}
function dragMove() {
    let current = d3.select(this);
    let parent = d3.select(this.parentNode);
    let counter = parent.attr("id");
    let tagName = current.node().tagName;
    if (tagName === "rect") {
        let newXCoordinate = d3.event.x + deltaX;
        let newYCoordinate = d3.event.y + deltaY;
        updateRectSize(newXCoordinate, newYCoordinate, counter, parent, current, false);
    }
}
function dragStartBorder() {
    let parent = d3.select(this.parentNode);
    let current = parent.select("rect");
    let tagName = current.node().tagName;
    if (tagName === "rect") {
        deltaXBorder = d3.event.x;
        deltaYBorder = d3.event.y;
        deltaX = current.attr("x") - d3.event.x;
        deltaY = current.attr("y") - d3.event.y;
        rectWidth = +current.attr("width");
        rectHeight = +current.attr("height");
    }
}
function dragMoveBorder() {
    let parent = d3.select(this.parentNode);
    let counter = parent.attr("id");
    let current = parent.select("rect");
    let tagName = current.node().tagName;
    let newRectWidth = rectWidth + (d3.event.x - deltaXBorder);
    let newRectHeight = rectHeight + (d3.event.y - deltaYBorder);
    if (tagName === "rect" && newRectWidth > 0 && newRectHeight > 0) {
        updateRectSize(newRectWidth, newRectHeight, counter, parent, current, true);
    }
}
function updateRectSize(newXCoordinate, newYCoordinate, counter, parent, current, borderMove) {
    if (borderMove) {
        current
            .attr("width", newXCoordinate)
            .attr("height", newYCoordinate);
    }
    else {
        let gridXCoordinate = newXCoordinate;
        let gridYCoordinate = newYCoordinate;
        let coordDifference = 1000;
        d3.select(".xGridAxis").selectAll(".tick").each(function () {
            let gridLine = d3.select(this);
            let coordinate = gridLine.attr("transform");
            coordinate = coordinate.substring(coordinate.indexOf("(") + 1, coordinate.indexOf(")")).split(",");
            let tempCoordDifference = Math.abs(newXCoordinate - coordinate[0]);
            if (tempCoordDifference < coordDifference && (+current.attr("width") + +coordinate[0]) <= width) {
                coordDifference = tempCoordDifference;
                gridXCoordinate = coordinate[0];
            }
        });
        coordDifference = 1000;
        d3.select(".yGridAxis").selectAll(".tick").each(function () {
            let gridLine = d3.select(this);
            let coordinate = gridLine.attr("transform");
            coordinate = coordinate.substring(coordinate.indexOf("(") + 1, coordinate.indexOf(")")).split(",");
            let tempCoordDifference = Math.abs(newYCoordinate - coordinate[1]);
            if (tempCoordDifference < coordDifference && (+current.attr("height") + +coordinate[1]) <= height) {
                coordDifference = tempCoordDifference;
                gridYCoordinate = coordinate[1];
            }
        });
        current
            .attr("x", gridXCoordinate)
            .attr("y", gridYCoordinate);
    }
    d3.select("#circleTop" + counter)
        .attr("cx", (+current.attr("x")) + (+current.attr("width") / 2))
        .attr("cy", +current.attr("y"));
    d3.select("#circleBottom" + counter)
        .attr("cx", (+current.attr("x")) + (+current.attr("width") / 2))
        .attr("cy", (+current.attr("y")) + +current.attr("height"));
    d3.select("#circleBottomRight" + counter)
        .attr("cx", (+current.attr("x")) + (+current.attr("width")) - 2)
        .attr("cy", (+current.attr("y")) + +current.attr("height") - 2);
    d3.select("#circleLeft" + counter)
        .attr("cx", (+current.attr("x")))
        .attr("cy", (+current.attr("y")) + (+current.attr("height") / 2));
    d3.select("#circleRight" + counter)
        .attr("cx", (+current.attr("x")) + +current.attr("width"))
        .attr("cy", (+current.attr("y")) + (+current.attr("height") / 2));
    d3.selectAll("line.circleTop" + counter)
        .attr("x1", (+current.attr("x")) + (+current.attr("width") / 2))
        .attr("y1", +current.attr("y"));
    d3.selectAll("line.circleBottom" + counter)
        .attr("x1", (+current.attr("x")) + (+current.attr("width") / 2))
        .attr("y1", (+current.attr("y")) + +current.attr("height"));
    d3.selectAll("line.circleLeft" + counter)
        .attr("x1", +current.attr("x"))
        .attr("y1", (+current.attr("y")) + (+current.attr("height") / 2));
    d3.selectAll("line.circleRight" + counter)
        .attr("x1", (+current.attr("x")) + +current.attr("width"))
        .attr("y1", (+current.attr("y")) + (+current.attr("height") / 2));
    d3.selectAll("line.circleTop" + counter + "Connector")
        .attr("x2", (+current.attr("x")) + (+current.attr("width") / 2))
        .attr("y2", +current.attr("y"));
    d3.selectAll("line.circleBottom" + counter + "Connector")
        .attr("x2", (+current.attr("x")) + (+current.attr("width") / 2))
        .attr("y2", (+current.attr("y")) + +current.attr("height"));
    d3.selectAll("line.circleLeft" + counter + "Connector")
        .attr("x2", +current.attr("x"))
        .attr("y2", (+current.attr("y")) + (+current.attr("height") / 2));
    d3.selectAll("line.circleRight" + counter + "Connector")
        .attr("x2", (+current.attr("x")) + +current.attr("width"))
        .attr("y2", (+current.attr("y")) + (+current.attr("height") / 2));
    if (parent != null) {
        parent.select("text.titleText")
            .attr("x", +current.attr("x") + 10)
            .attr("y", +current.attr("y") + 20);
        parent.select("text.contentText")
            .attr("x", +current.attr("x") + 10)
            .attr("y", +current.attr("y") + 40);
    }
}
function mouseUp() {
    if (d3.event.button != 2) {
        svg.on("mousemove", null);
        let parent = rect.select(function () {
            return this.parentNode;
        });
        let width = +rect.attr("width");
        let height = +rect.attr("height");
        let surface = width * height;
        if (surface < 2000) {
            parent.remove();
        }
        g.append("text")
            .attr("x", +rect.attr("x") + 10)
            .attr("y", +rect.attr("y") + 20)
            .attr("font-weight", 20)
            .attr("class", "titleText")
            .style('font-size', 22)
            .text();
        g.append("text")
            .attr("x", +rect.attr("x") + 10)
            .attr("y", +rect.attr("y") + 40)
            .attr("class", "contentText")
            .text();
    }
}
function drawLine() {
    let current = d3.select(this);
    let parent = d3.select(this.parentNode);
    let cx = current.attr("cx");
    let cy = current.attr("cy");
    line = parent.append("line");
    line.attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", cx)
        .attr("y2", cy)
        .attr("stroke", "grey")
        .attr("stroke-width", 3)
        .attr("class", current.attr("id"))
        .attr("marker-end", "url(#arrow)");
    svg.on("mousemove", moveLine);
}
function removeLine() {
    line.remove();
    resetListeners();
}
function resetListeners() {
    let count = null;
    svg
        .on("mousemove", null)
        .on("mousedown", mousedown)
        .on("mouseup", mouseUp)
        .on("dblclick", null);
    d3.selectAll("circle")
        .raise()
        .on("click", drawLine);
    svg.selectAll("rect")
        .on("dblclick", openNav)
        .each(function () {
        count = d3.select(this.parentNode).attr("id");
        d3.select(`#circleBottomRight${count}`)
            .on("click", null);
    });
}
function moveLine() {
    let event = d3.mouse(this);
    line.attr("x2", event[0])
        .attr("y2", event[1]);
    svg
        .on("mousedown", null)
        .on("mouseup", null)
        .on("dblclick", removeLine);
    d3.selectAll("circle")
        .raise()
        .on("click", combineRect);
}
function combineRect() {
    let current = d3.select(this);
    let parent = d3.select(this.parentNode);
    let x1 = line.attr("x1");
    let y1 = line.attr("y1");
    let sameRect = false;
    parent.selectAll("circle").each(function () {
        let cx = d3.select(this).attr("cx");
        let cy = d3.select(this).attr("cy");
        if (x1 == cx && y1 == cy) {
            sameRect = true;
        }
    });
    let id = d3.select(this).attr("id");
    id = id.slice(0, -1);
    if (!sameRect && id != "circleBottomRight") {
        line
            .attr("x2", current.attr("cx"))
            .attr("y2", current.attr("cy"))
            .attr("class", line.attr("class") + " " + current.attr("id") + "Connector");
        resetListeners();
    }
}
function openNav() {
    let current = d3.select(this);
    let parent = d3.select(this.parentNode);
    let id = parent.attr("id");
    resetListeners();
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById('rectInfo').innerHTML = id;
    let titleText = document.getElementById("titleText");
    let contentText = document.getElementById("contentText");
    let colorPicker = document.getElementById("colorPicker");
    titleText.value = parent.select("text.titleText").text();
    contentText.value = parent.select("text.contentText").text();
    colorPicker.value = current.attr("fill");
    listFiles(id);
    svg.selectAll("rect")
        .style("stroke", "#7b9eb4");
    d3.select(this)
        .style("stroke", "red")
        .on("dblclick", closeNav);
}
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById('rectInfo').innerHTML = "";
    let titleText = document.getElementById("titleText");
    let contentText = document.getElementById("contentText");
    titleText.value = "";
    contentText.value = "";
    resetRectBorder();
    resetListeners();
}
function resetRectBorder() {
    svg.selectAll("rect")
        .style("stroke", "#7b9eb4");
}
function updateRectText(object) {
    let id = document.getElementById('rectInfo').innerHTML;
    svg.selectAll("g").each(function () {
        let element = d3.select(this);
        if (element.attr("id") == id) {
            element.select("text." + object.id).html(object.value);
        }
    });
}
function updateRectColor(object) {
    let id = document.getElementById('rectInfo').innerHTML;
    svg.selectAll("g").each(function () {
        let element = d3.select(this);
        if (element.attr("id") == id) {
            element.select("rect").attr("fill", object.value);
        }
    });
}
function uploadFile() {
    let file_input = document.querySelector('[type=file]');
    let files = file_input.files;
    let name = files[0].name;
    if (name.substr(name.length - 3) == "pdf") {
        let formData = new FormData();
        formData.append('file', files[0]);
        let rectInfo = document.getElementById('rectInfo').innerHTML;
        let url = '/treeEditor/files/upload?rectInfo=' + rectInfo;
        fetch(url, {
            method: 'POST',
            body: formData,
        })
            .then(response => response.text())
            .then(function (data) {
            updateFileList(data);
            saveProject();
        });
    }
    else {
        alert("Only .pdf attachments are allowed");
    }
}
function updateFileList(filename) {
    let file = document.getElementById("fileChooser");
    let ul = document.getElementById("fileList");
    let entries = d3.select("#fileList").selectAll("li");
    let isDuplicate = false;
    entries.each(function () {
        let str = this.textContent.slice(0, -1);
        if (str == file.files[0].name) {
            isDuplicate = true;
        }
    });
    if (!isDuplicate) {
        let li = document.createElement("li");
        let span = document.createElement("span");
        li.appendChild(document.createTextNode(file.files[0].name));
        li.setAttribute("id", filename);
        span.setAttribute("class", "close");
        span.appendChild(document.createTextNode("x"));
        li.appendChild(span);
        ul.appendChild(li);
        initializeDeleteFileListListener();
        li.addEventListener("click", function () {
            getUploadedFile(filename);
        });
    }
}
function initializeDeleteFileListListener() {
    let btnList = document.getElementsByClassName("close");
    for (let i = 0; i < btnList.length; i++) {
        btnList[i].addEventListener("click", function (e) {
            let filename = this.parentElement.getAttribute("id");
            deleteFile(filename);
            this.parentElement.remove();
            saveProject();
            e.stopPropagation();
        });
    }
}
function getUploadedFile(filename) {
    let url = '/treeEditor/files?filename=' + filename;
    fetch(url, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.blob())
        .then(function (blob) {
        url = URL.createObjectURL(blob);
        window.open(url);
    });
}
function deleteFile(filename) {
    let url = '/treeEditor/files/delete?filename=' + filename;
    fetch(url, {
        method: 'POST'
    });
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
function saveProject() {
    let project = document.getElementById("projectTitle");
    let projectName = project.innerHTML;
    let projectID = project.className;
    let url = '/treeEditor/save?projectName=' + projectName + '&projectID=' + projectID;
    let nodes = document.getElementById("nodes");
    let nodes_json = toJSON(nodes);
    let files = document.getElementById("fileList");
    let files_json = toJSON(files);
    let data = JSON.stringify({ nodes: nodes_json, files: files_json });
    fetch(url, {
        method: 'POST',
        body: data
    })
        .then(response => response.json())
        .then(data => saveProjectID(data));
}
function saveProjectID(projectID) {
    let projectTitle = document.getElementById("projectTitle");
    projectTitle.setAttribute("class", projectID);
    showSavePopup();
}
function showSavePopup() {
    let popup = document.getElementById("popup");
    popup.style.opacity = '50%';
    popup.style.display = "block";
    setTimeout(function () {
        popup.style.opacity = '0';
    }, 2000);
}
function updateProjectNodes(data) {
    let svg = document.getElementById("nodes");
    for (let element of data) {
        let node = toDOM(element["element"]);
        svg.appendChild(document.importNode(new DOMParser()
            .parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + node.outerHTML + '</svg>', 'application/xml').documentElement.firstChild, true));
    }
    initializeRectListeners();
    initializeCircleListeners();
    resetRectBorder();
}
function getProjectNodes(id) {
    let url = '/treeEditor/nodes?id=' + id;
    fetch(url, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => updateProjectNodes(data));
}
function updateProjectFiles(data) {
    let nav = document.getElementById("fileList");
    for (let element of data) {
        let node = toDOM(element["element"]);
        nav.appendChild(document.importNode(node, true));
    }
    let items = nav.getElementsByTagName("li");
    for (let i = items.length; i--;) {
        items[i].addEventListener("click", function () {
            getUploadedFile(items[i].getAttribute("id"));
        });
    }
    initializeDeleteFileListListener();
}
function getProjectFiles(id) {
    let url = '/treeEditor/projectFiles?id=' + id;
    fetch(url, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => updateProjectFiles(data));
}
function loadProject() {
    let urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    let name = urlParams.get('name');
    if (id != null && name != null) {
        updateProjectName(name, id);
        getProjectFiles(id);
        getProjectNodes(id);
    }
}
function updateProjectName(name, id) {
    let projectTitle = document.getElementById("projectTitle");
    projectTitle.innerText = name;
    projectTitle.setAttribute("class", id);
}
