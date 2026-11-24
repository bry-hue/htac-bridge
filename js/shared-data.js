
/* =========================================================
   HTAC CONNECT - SHARED GOOGLE SHEETS BRIDGE
   Version: Improved Save + Verification
========================================================= */

(function () {
    "use strict";

    var API_URL =
        "https://script.google.com/macros/s/AKfycbykBefhBF3tuIbhU9zPQH-bCWJzDMNyOp9vR4Cova-Y64U1k4CQ0jsyiOeJ8h49g-WhXA/exec";

    var KEY_MAP = {
        "htac_connect_announcements": "announcements",
        "htac_connect_faculty": "faculty",
        "htac_research_team": "team",
        "htac_research_ratings": "ratings",
        "htac_research_comments": "comments"
    };

    var originalSetItem = Storage.prototype.setItem;

    var saveQueue = Promise.resolve();
    var callbackCounter = 0;

    /* =====================================================
       JSONP REQUEST
    ===================================================== */

    function jsonp(action) {

        return new Promise(function (resolve, reject) {

            var callbackName =
                "__htacCallback_" +
                new Date().getTime() +
                "_" +
                (++callbackCounter);

            var script = document.createElement("script");
            var finished = false;

            function cleanup() {

                clearTimeout(timer);

                try {
                    delete window[callbackName];
                } catch (e) {
                    window[callbackName] = undefined;
                }

                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }

            var timer = setTimeout(function () {

                if (finished) return;

                finished = true;
                cleanup();

                reject(
                    new Error("HTAC API request timed out.")
                );

            }, 15000);

            window[callbackName] = function (result) {

                if (finished) return;

                finished = true;
                cleanup();

                resolve(result);
            };

            script.onerror = function () {

                if (finished) return;

                finished = true;
                cleanup();

                reject(
                    new Error("Unable to connect to HTAC API.")
                );
            };

            script.src =
                API_URL +
                "?action=" + encodeURIComponent(action) +
                "&callback=" + encodeURIComponent(callbackName) +
                "&t=" + new Date().getTime();

            document.head.appendChild(script);
        });
    }

    /* =====================================================
       LOAD ALL SHARED DATA
    ===================================================== */

    function loadSharedData() {

        return jsonp("getAll").then(function (result) {

            if (!result || !result.success || !result.data) {
                throw new Error("Invalid HTAC API response.");
            }

            var data = result.data;

            window.HTACSharedTeamInitialized =
                data.teamInitialized === true;

            Object.keys(KEY_MAP).forEach(function (localKey) {

                var apiKey = KEY_MAP[localKey];

                if (
                    Object.prototype.hasOwnProperty.call(
                        data,
                        apiKey
                    )
                ) {

                    originalSetItem.call(
                        localStorage,
                        localKey,
                        JSON.stringify(data[apiKey])
                    );
                }
            });

            console.log(
                "HTAC Connect: Shared data loaded successfully."
            );

            return result;

        });
    }

    /* =====================================================
       VERIFY SAVED DATA
    ===================================================== */

    function verifySavedData(key, expectedValue, attempts) {

        attempts = attempts || 1;

        return jsonp("getAll").then(function (result) {

            if (!result || !result.success || !result.data) {
                throw new Error("Unable to verify saved data.");
            }

            var apiKey = KEY_MAP[key];
            var remoteValue = result.data[apiKey];

            var expected = JSON.stringify(expectedValue);
            var actual = JSON.stringify(remoteValue);

            if (expected === actual) {

                console.log(
                    "HTAC Connect: " + apiKey +
                    " successfully saved and verified."
                );

                return true;
            }

            if (attempts >= 3) {

                throw new Error(
                    "Save verification failed for " + apiKey +
                    ". Google Sheets still contains different data."
                );
            }

            return new Promise(function (resolve) {

                setTimeout(function () {

                    resolve(
                        verifySavedData(
                            key,
                            expectedValue,
                            attempts + 1
                        )
                    );

                }, 1500);

            });

        });
    }

    /* =====================================================
       SEND SAVE REQUEST
    ===================================================== */

    function sendSave(key, value) {

        if (!KEY_MAP[key]) {
            return Promise.resolve();
        }

        var pin =
            sessionStorage.getItem("htac_admin_pin") || "";

        // Protected data requires an administrator PIN.
        if (
            key === "htac_connect_announcements" ||
            key === "htac_connect_faculty" ||
            key === "htac_research_team"
        ) {

            if (!pin) {

                console.error(
                    "HTAC Connect: Save blocked. " +
                    "Administrator PIN is missing."
                );

                return Promise.reject(
                    new Error("Administrator PIN is missing.")
                );
            }
        }

        var payload = {
            action: "save",
            key: KEY_MAP[key],
            value: value,
            pin: pin
        };

        console.log(
            "HTAC Connect: Sending save request for " +
            KEY_MAP[key]
        );

        return fetch(API_URL, {

            method: "POST",
            mode: "no-cors",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(payload)

        }).then(function () {

            // no-cors does not expose the server response.
            // Verify by reading the data back from Google Sheets.

            return new Promise(function (resolve) {

                setTimeout(resolve, 1500);

            });

        }).then(function () {

            return verifySavedData(key, value);

        });
    }

    /* =====================================================
       QUEUE SAVE REQUESTS
       Prevent simultaneous writes to the same spreadsheet.
    ===================================================== */

    function syncValue(key, value) {

        if (!KEY_MAP[key]) return;

        saveQueue = saveQueue.then(function () {

            return sendSave(key, value);

        }).catch(function (error) {

            console.error(
                "HTAC Connect SAVE ERROR:",
                error.message || error
            );

            // Keep the queue alive so later saves can proceed.
        });

        return saveQueue;
    }

    /* =====================================================
       INTERCEPT LOCAL STORAGE CHANGES
    ===================================================== */

    Storage.prototype.setItem = function (key, value) {

        originalSetItem.call(this, key, value);

        if (
            this === window.localStorage &&
            KEY_MAP[key]
        ) {

            var parsedValue;

            try {
                parsedValue = JSON.parse(value);
            } catch (e) {
                parsedValue = value;
            }

            syncValue(key, parsedValue);
        }
    };

    /* =====================================================
       PAGE SCRIPT LOADER
    ===================================================== */

    function loadScripts() {

        var page = location.pathname.toLowerCase();

        var files = ["js/main.js"];

        if (page.indexOf("announcements.html") >= 0) {

            files.push("js/announcements.js");

        } else if (page.indexOf("calendar.html") >= 0) {

            files.push("js/calendar.js");

        } else if (page.indexOf("faculty.html") >= 0) {

            files.push("js/faculty.js");

        } else if (page.indexOf("about.html") >= 0) {

            files.push("js/research-team.js");
            files.push("js/research-team-admin.js");
        }

        function loadAt(index) {

            if (index >= files.length) {

                if (document.readyState === "complete") {

                    var readyEvent;

                    try {

                        readyEvent = new Event(
                            "DOMContentLoaded",
                            { bubbles: true }
                        );

                    } catch (e) {

                        readyEvent = document.createEvent("Event");

                        readyEvent.initEvent(
                            "DOMContentLoaded",
                            true,
                            true
                        );
                    }

                    document.dispatchEvent(readyEvent);
                }

                return;
            }

            var script = document.createElement("script");

            script.async = false;
            script.src = files[index];

            script.onload = function () {
                loadAt(index + 1);
            };

            script.onerror = function () {

                console.error(
                    "Unable to load HTAC script: " + files[index]
                );

                loadAt(index + 1);
            };

            document.body.appendChild(script);
        }

        loadAt(0);
    }

    /* =====================================================
       PUBLIC HTAC SHARED API
    ===================================================== */

    window.HTACShared = {

        apiUrl: API_URL,

        refresh: function () {
            return loadSharedData();
        },

        save: function (key, value) {
            return syncValue(key, value);
        }

    };

    /* =====================================================
       INITIALIZATION
    ===================================================== */

    loadSharedData()

        .catch(function (error) {

            console.warn(
                "HTAC Connect: Using local data because " +
                "shared data could not be loaded.",
                error
            );

        })

        .then(function () {

            loadScripts();

        });

}());
