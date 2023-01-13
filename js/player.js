/**
 * Copyright (C) 2020-2023, by XunScore contributors (xunscore@139.com)
 * Report bugs and download new versions at http://www.xunscore.cn/
 *
 * This library is distributed under the MIT License. See notice at the end
 * of this file.
 */
var version;
var stamps;
const player = document.getElementById("player");
const play = document.getElementById("play");
const pause = document.getElementById("pause");
const seekbar = document.getElementById("seekbar");
const playbar = document.getElementById("playbar");
const currenttime = document.getElementById("currenttime");
const duration = document.getElementById("duration");
const zoomout = document.getElementById("zoomout");
const zoomin = document.getElementById("zoomin");
const thumbtack = document.getElementById("thumbtack");
const scorepanel = document.getElementById("scorepanel");
player.onplay = function () {
  play.style.display = "none";
  pause.style.display = "inline";
};
player.onpause = function () {
  play.style.display = "inline";
  pause.style.display = "none";
};
player.ontimeupdate = function () {
  var second = this.currentTime;
  var low = 0;
  var high = stamps.length - 1;
  while (low <= high) {//lower_bound
    var mid = parseInt((high + low) / 2);
    if (stamps[mid].second >= second) high = mid - 1;
    else low = mid + 1;
  }
  var cur = high < (stamps.length - 1) ? high : (stamps.length - 1);
  if (stamps[cur]) {
    var indicator = document.getElementById(stamps[cur].slice);
    indicator.setAttribute("fill", "#007bff");
    indicator.setAttribute("fill-opacity", 0.3);
    if (thumbtack.scroll) window.scrollTo({ top: indicator.getBoundingClientRect().top + indicator.ownerDocument.defaultView.pageYOffset - window.innerHeight * 0.2, behavior: "smooth" });
  }
  if (stamps[this.pre] && (this.pre != cur)) document.getElementById(stamps[this.pre].slice).setAttribute("fill-opacity", 0);
  this.pre = cur;
  currenttime.innerHTML = formattime(this.currentTime);
  playbar.style.width = this.currentTime / this.duration * 100 + "%";
};
play.onclick = function () {
  if (isNaN(player.duration)) return;
  player.play();
};
pause.onclick = function () {
  if (isNaN(player.duration)) return;
  player.pause();
};
seekbar.onclick = function (event) {
  if (isNaN(player.duration)) return;
  player.currentTime = player.duration * event.offsetX / seekbar.offsetWidth;
}
zoomout.onclick = function () {
  if (this.zoom == null) {
    var width = parseInt(scorepanel.querySelector("svg").getAttribute("width")) - 1;
    scorepanel.querySelectorAll("svg").forEach(function (svg) {
      svg.setAttribute("width", width + "%");
    });
  }
}
zoomout.onmousedown = function () {
  this.zoom = setInterval(function () {
    var width = parseInt(scorepanel.querySelector("svg").getAttribute("width")) - 1;
    scorepanel.querySelectorAll("svg").forEach(function (svg) {
      svg.setAttribute("width", width + "%");
    });
  }, 100);
}
zoomout.onmouseup = function () {
  clearInterval(this.zoom);
  this.zoom = null;
}
zoomin.onclick = function () {
  if (this.zoom == null) {
    var width = parseInt(scorepanel.querySelector("svg").getAttribute("width")) + 1;
    scorepanel.querySelectorAll("svg").forEach(function (svg) {
      svg.setAttribute("width", width + "%");
    });
  }
}
zoomin.onmousedown = function () {
  this.zoom = setInterval(function () {
    var width = parseInt(scorepanel.querySelector("svg").getAttribute("width")) + 1;
    scorepanel.querySelectorAll("svg").forEach(function (svg) {
      svg.setAttribute("width", width + "%");
    });
  }, 100);
}
zoomin.onmouseup = function () {
  clearInterval(this.zoom);
  this.zoom = null;
}
thumbtack.onclick = function () {
  this.scroll = this.scroll ? false : true;
  this.scroll ? thumbtack.firstElementChild.removeAttribute("fill") : thumbtack.firstElementChild.setAttribute("fill", "white");
}
document.getElementById("open").onclick = function () {
  document.getElementById("file").click();
};
function formattime(value) {
  var m = parseInt(value / 60);
  var s = parseInt(value - m * 60);
  return m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
}
function fromCharCode(data) {
  var res = "";
  var chunk = 8 * 1024;
  var i;
  for (i = 0; i < data.length / chunk; i++) res += String.fromCharCode.apply(null, data.slice(i * chunk, (i + 1) * chunk));
  res += String.fromCharCode.apply(null, data.slice(i * chunk));
  return res
}
function uzip(result) {
  var zip = new ZipFile(result);
  var data = zip.read("json");
  if (!data) { scorepanel.innerHTML += "<H1 style='color:white'>410</H1>"; return; }
  var json = JSON.parse(String.fromCharCode.apply(null, data));
  version = json.version ? parseInt(json.version.split(".").join("")) : 100;
  stamps = json.stamps;
  scorepanel.innerHTML = "";
  var pnb = 1;
  while (data = zip.read((pnb++) + ".svg")) scorepanel.innerHTML += fromCharCode(data);
  var lastsvg;
  scorepanel.querySelectorAll("svg").forEach(function (svg) {
    svg.setAttribute("width", "95%");
    svg.setAttribute("style", "background-color: white;box-shadow : 0px 0px 10px rgba(0, 0, 0, 1);");
    svg.insertAdjacentHTML("beforebegin", "<div style='height: 30px;'/>");
    lastsvg = svg;
  });
  lastsvg.insertAdjacentHTML("afterend", "<div style='height: 10px;'/>");
  if (data = zip.read("mp3")) {
    const source = document.createElement("source");
    source.setAttribute("src", URL.createObjectURL(new Blob([data], { type: "audio/mpeg" })));
    source.setAttribute("type", "audio/mpeg");
    player.appendChild(source);
  }
  else if (data = zip.read("oga")) {
    const source = document.createElement("source");
    source.setAttribute("src", URL.createObjectURL(new Blob([data], { type: "audio/ogg" })));
    source.setAttribute("type", "audio/ogg");
    player.appendChild(source);
  }
  var browser = setInterval(function () { // for all browser
    if (isNaN(player.duration)) return;
    play.firstElementChild.setAttribute("fill", "white");
    pause.firstElementChild.setAttribute("fill", "white");
    currenttime.style.color = "white";
    duration.style.color = "white";
    duration.innerHTML = formattime(player.duration);
    zoomout.firstElementChild.setAttribute("fill", "white");
    zoomin.firstElementChild.setAttribute("fill", "white");
    clearInterval(browser);
  }, 200);
}
function request(file) {
  if (arguments.length) {
    var fileReader = new FileReader();
    fileReader.onload = function (event) { uzip(event.target.result); };
    fileReader.readAsArrayBuffer(file);
  } else {
    var avg = function (key) {
      var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substring(1).match(reg);
      if (r != null) return (r[2]); return null;
    }
    if (avg("url") == null) return;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", decodeURIComponent(avg("url")), true);
    xhr.responseType = "arraybuffer";
    xhr.onloadend = function () {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) uzip(xhr.response);
      else scorepanel.innerHTML += "<H1 style='color:white'>" + xhr.status + "</H1>";
    }
    xhr.send();
  }
  document.getElementById("open").style.display = "none";
}
/**
 * Copyright (c) 2020-2023 XunScore contributors
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
