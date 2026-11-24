/* HTAC Connect Google Apps Script API
   Deploy as Web app: Execute as Me; access Anyone (if allowed).
   Keep this server-side admin PIN private and change it before production. */
var HTAC_ADMIN_PIN = "CHANGE-THIS-PIN";
var HTAC_KEYS = {
  announcements: "Announcements",
  faculty: "Faculty",
  ratings: "Ratings",
  comments: "Comments"
};

function doGet(e) {
  var p = (e && e.parameter) || {};
  var result;
  if (p.action === "getAnnouncements") {
    result = { success: true, announcements: readAnnouncements_() };
  } else if (p.action === "getAll") {
    result = { success: true, data: readAll_() };
  } else {
    result = { success: true, message: "HTAC Connect API is running!" };
  }
  var output = JSON.stringify(result);
  if (p.callback && /^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(p.callback)) {
    return ContentService.createTextOutput(p.callback + "(" + output + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (body.action !== "save" || !HTAC_KEYS[body.key]) return json_({ success: false, message: "Invalid action or key." });
    if (body.key === "announcements" || body.key === "faculty") {
      if (!body.pin || body.pin !== HTAC_ADMIN_PIN) return json_({ success: false, message: "Administrator authorization required." });
    }
    if (body.key === "ratings" || body.key === "comments") {
      if (!Array.isArray(body.value)) return json_({ success: false, message: "Expected a list." });
    }
    writeData_(body.key, body.value);
    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, message: String(err) });
  }
}

function readAll_() {
  return {
    announcements: readAnnouncements_(),
    faculty: readJsonRows_("Faculty"),
    ratings: readJsonRows_("Ratings"),
    comments: readJsonRows_("Comments")
  };
}

function readAnnouncements_() {
  var sh = getSheet_("Announcements", ["ID", "Title", "Content", "Date", "Category", "CreatedAt", "ShowOnCalendar"]);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (x) { return String(x).trim(); });
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row.every(function (v) { return v === ""; })) continue;
    var item = {};
    headers.forEach(function (h, j) {
      var v = row[j];
      if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      if (h === "Content") item.text = v;
      else if (h === "ShowOnCalendar") item.showOnCalendar = String(v).toLowerCase() !== "false";
      else if (h) item[h.charAt(0).toLowerCase() + h.slice(1)] = v;
    });
    if (item.id !== "" && item.id !== null && item.id !== undefined) out.push(item);
  }
  return out;
}

function writeData_(key, value) {
  if (key === "announcements") {
    var sh = getSheet_("Announcements", ["ID", "Title", "Content", "Date", "Category", "CreatedAt", "ShowOnCalendar"]);
    sh.clearContents();
    sh.getRange(1, 1, 1, 7).setValues([["ID", "Title", "Content", "Date", "Category", "CreatedAt", "ShowOnCalendar"]]);
    if (!Array.isArray(value) || !value.length) return;
    var rows = value.map(function (a) { return [a.id || "", a.title || "", a.text || a.content || "", a.date || "", a.category || "", a.createdAt || "", a.showOnCalendar === false ? false : true]; });
    sh.getRange(2, 1, rows.length, 7).setValues(rows);
    return;
  }
  var sheetName = HTAC_KEYS[key];
  var data = Array.isArray(value) ? value : [];
  var sh2 = getSheet_(sheetName, ["JSON"]);
  sh2.clearContents();
  sh2.getRange(1, 1).setValue("JSON");
  if (data.length) {
    var rows2 = data.map(function (item) { return [JSON.stringify(item)]; });
    sh2.getRange(2, 1, rows2.length, 1).setValues(rows2);
  }
}

function readJsonRows_(sheetName) {
  var sh = getSheet_(sheetName, ["JSON"]);
  var values = sh.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) {
    if (!values[i][0]) continue;
    try { out.push(JSON.parse(values[i][0])); } catch (e) {}
  }
  return out;
}

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sh;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
