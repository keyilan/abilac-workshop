const fs = require("fs");
const path = require("path");
let tsvFiles = [];
fs.readdir("./", (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }
  files.forEach((file) => {
    if (path.extname(file) === ".tsv") {
      tsvFiles.push(file);
    }
  });
  console.log(tsvFiles);
  let filename = tsvFiles[0];
  let title = filename.split(" - ");
  title = title[0];
  if (!filename) {
    console.error("Please provide a filename as a command-line argument.");
    process.exit(1);
  }
  let separator = "	";
  if (filename.includes(".tsv")) {
    separator = "	";
  } else if (filename.includes(".csv")) {
    separator = ",";
  }
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    data = data.split(/\r\n|\n\r|\r|\n/);
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i].split(separator);
    }
    let header = data[0];
    let all = [];
    for (let i = 1; i < data.length; i++) {
      let obj = {
        headword: "",
        definition: "",
        "part of speech": "",
        category: "",
        comments: "",
        "see also": "",
      };
      obj.headword = data[i][header.indexOf("headword")];
      obj.pos = data[i][header.indexOf("part of speech")];
      obj.definition = data[i][header.indexOf("definition")];
      obj.category = data[i][header.indexOf("category")];
      obj.comments = data[i][header.indexOf("comments")];
      obj.seealso = data[i][header.indexOf("see also")];
      if (i > 0) {
        all.push(obj);
      }
    }
    console.log(all);
    let string = "<html><head></head><body>";
    string +=
      '<style type="text/css">* {padding: 0; margin: 0;} html {font-size:16px; line-height: 1.5rem;} body {padding: 1rem;} h1 {padding-bottom: 0.5rem; font-size: 1.5rem} .entry > span {padding-right: 0.5rem;} .entry {padding-bottom: 0.5rem;} .headword {font-weight: bold;} .pos {font-style: italic;} a {text-decoration: none;}</style>';
    string += "<h1>" + title + "</h1>";
    for (let i = 0; i < all.length; i++) {
      let obj = all[i];
      string +=
        '<div class="entry" id="' + obj.headword.replace(/\s/g, "_") + '">';
      string += '<span class="headword">' + obj.headword + "</span>";
      string += '<span class="pos">' + obj.pos + "</span>";
      string += '<span class="definition">' + obj.definition + "</span>";
      if (obj.seealso.trim() != "") {
        string +=
          '<span class="seealso">see also: <a href="#' +
          obj.seealso.replace(/\s/g, "_") +
          '">' +
          obj.seealso +
          "</a></span>";
      }
      string += "</div>";
    }
    string += "</body></html>";
    fs.writeFile(title + ".html", string, (err) => {
      if (err) {
        console.error("Error writing to the file:", err);
        return;
      }
      console.log("File has been written successfully.");
    });
  });
});