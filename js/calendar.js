/* ============================================================
   HTAC CONNECT
   SCHOOL CALENDAR
   ============================================================ */


/* ============================================================
   STORAGE
   ============================================================ */

var ANNOUNCEMENT_STORAGE_KEY =
    "htac_connect_announcements";


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

var calendar =
    document.getElementById("calendar");

var title =
    document.getElementById("monthTitle");

var eventList =
    document.getElementById("eventList");

var previousButton =
    document.getElementById("prevMonth");

var nextButton =
    document.getElementById("nextMonth");


/* ============================================================
   CURRENT MONTH
   ============================================================ */

/*
   Always start with the actual current month.

   Example:
   If today is September 9, 2026,
   the calendar opens on September 2026.
*/

var today =
    new Date();

var current =
    new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );


/* ============================================================
   LOAD ANNOUNCEMENTS
   ============================================================ */

function getCalendarAnnouncements() {

    var saved =
        localStorage.getItem(
            ANNOUNCEMENT_STORAGE_KEY
        );

    if (!saved) {
        return [];
    }

    try {

        var announcements =
            JSON.parse(saved);

        if (!Array.isArray(announcements)) {
            return [];
        }

        return announcements;

    } catch (error) {

        console.log(
            "Unable to load announcements for calendar.",
            error
        );

        return [];
    }
}


/* ============================================================
   NORMALIZE ANNOUNCEMENT DATE
   ============================================================ */

function normalizeCalendarDate(value) {

    if (value === null || value === undefined) {
        return "";
    }

    var dateText = String(value).trim();

    /*
       Keep YYYY-MM-DD dates as-is, including values with
       a time component after the date.
    */

    var match = dateText.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
        return match[1] + "-" + match[2] + "-" + match[3];
    }

    /*
       Google Apps Script may return a date like:
       Mon Oct 26 2026 00:00:00 GMT+0800 (China Standard Time)

       Parse it and return YYYY-MM-DD using local date parts
       so the calendar can match the event to the correct day.
    */

    var parsedDate = new Date(dateText);

    if (isNaN(parsedDate.getTime())) {
        return "";
    }

    var year = parsedDate.getFullYear();
    var month = String(parsedDate.getMonth() + 1);
    var day = String(parsedDate.getDate());

    if (month.length < 2) {
        month = "0" + month;
    }

    if (day.length < 2) {
        day = "0" + day;
    }

    return year + "-" + month + "-" + day;
}

/* ============================================================
   CONVERT ANNOUNCEMENTS TO CALENDAR EVENTS
   ============================================================ */

function getCalendarEvents() {

    var announcements =
        getCalendarAnnouncements();

    return announcements
        .filter(function (announcement) {

            /*
               If showOnCalendar is explicitly false,
               do not display the announcement.

               Older announcements without this property
               will still appear on the calendar.
            */

            return announcement.showOnCalendar !== false;
        })

        .map(function (announcement) {

            return {

                id:
                    announcement.id,

                date:
                    normalizeCalendarDate(announcement.date),

                title:
                    announcement.title || "Untitled announcement",

                type:
                    announcement.category || "General",

                text:
                    announcement.text || announcement.content || ""
            };
        });
}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatCalendarDate(dateString) {

    if (!dateString) {
        return "";
    }

    var date =
        new Date(
            dateString + "T00:00:00"
        );

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );
}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeCalendarHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   RENDER CALENDAR
   ============================================================ */

function renderCalendar() {

    /*
       Make sure the calendar elements exist.
    */

    if (!calendar) {

        console.error(
            "Calendar element #calendar was not found."
        );

        return;
    }

    if (!title) {

        console.error(
            "Month title element #monthTitle was not found."
        );

        return;
    }


    /* ========================================================
       CURRENT MONTH VALUES
       ======================================================== */

    var year =
        current.getFullYear();

    var month =
        current.getMonth();


    /* ========================================================
       FIRST AND LAST DAY OF MONTH
       ======================================================== */

    var firstDay =
        new Date(
            year,
            month,
            1
        );

    var lastDay =
        new Date(
            year,
            month + 1,
            0
        );


    /* ========================================================
       ACTUAL TODAY
       ======================================================== */

    /*
       IMPORTANT:

       This is recalculated every time the calendar renders.

       Therefore:
       September 9, 2026
       becomes the highlighted date automatically.
    */

    var actualToday =
        new Date();

    var todayYear =
        actualToday.getFullYear();

    var todayMonth =
        actualToday.getMonth();

    var todayDate =
        actualToday.getDate();


    /* ========================================================
       MONTH TITLE
       ======================================================== */

    title.textContent =
        current.toLocaleString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    /* ========================================================
       LOAD EVENTS
       ======================================================== */

    var events =
        getCalendarEvents();


    /* ========================================================
       WEEKDAY HEADERS
       ======================================================== */

    var html = [

        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"

    ]
    .map(function (dayName) {

        return (
            '<div class="day-name">' +
                escapeCalendarHtml(dayName) +
            '</div>'
        );

    })
    .join("");


    /* ========================================================
       EMPTY DAYS BEFORE MONTH START
       ======================================================== */

    for (
        var i = 0;
        i < firstDay.getDay();
        i++
    ) {

        html +=
            '<div class="day muted"></div>';
    }


    /* ========================================================
       CREATE DAYS
       ======================================================== */

    for (
        var day = 1;
        day <= lastDay.getDate();
        day++
    ) {

        /* ====================================================
           CREATE YYYY-MM-DD STRING
           ==================================================== */

        var dateString =
            year +
            "-" +
            String(month + 1).padStart(2, "0") +
            "-" +
            String(day).padStart(2, "0");


        /* ====================================================
           CHECK IF THIS IS TODAY
           ==================================================== */

        var isToday =
            year === todayYear &&
            month === todayMonth &&
            day === todayDate;


        /*
           Add the "today" CSS class ONLY to today's cell.
        */

        var todayClass =
            isToday
                ? " today"
                : "";


        /* ====================================================
           FIND EVENTS FOR THIS DAY
           ==================================================== */

        var found =
            events.filter(function (event) {

                return event.date === dateString;

            });


        /* ====================================================
           CREATE EVENT HTML
           ==================================================== */

        var eventsHtml =
            found
                .map(function (event) {

                    return (

                        '<div class="event-dot" ' +

                            'title="' +
                                escapeCalendarHtml(
                                    event.text
                                ) +
                            '">' +

                            escapeCalendarHtml(
                                event.title
                            ) +

                        '</div>'
                    );

                })
                .join("");


        /* ====================================================
           CREATE DAY CELL
           ==================================================== */

        html +=

            '<div class="day' +
                todayClass +
            '">' +

                '<div class="day-number">' +
                    day +
                '</div>' +

                eventsHtml +

            '</div>';
    }


    /* ========================================================
       UPDATE CALENDAR
       ======================================================== */

    calendar.innerHTML =
        html;


    /* ========================================================
       UPDATE EVENT LIST
       ======================================================== */

    if (!eventList) {
        return;
    }


    /* ========================================================
       GET EVENTS FOR CURRENT MONTH
       ======================================================== */

    var monthEvents =
        events.filter(function (event) {

            if (!event.date) {
                return false;
            }

            var date =
                new Date(
                    event.date +
                    "T00:00:00"
                );

            if (isNaN(date.getTime())) {
                return false;
            }

            return (
                date.getFullYear() === year &&
                date.getMonth() === month
            );

        });


    /* ========================================================
       SORT EVENTS BY DATE
       ======================================================== */

    monthEvents.sort(
        function (a, b) {

            return (

                new Date(
                    a.date +
                    "T00:00:00"
                ).getTime()

                -

                new Date(
                    b.date +
                    "T00:00:00"
                ).getTime()

            );

        }
    );


    /* ========================================================
       NO EVENTS
       ======================================================== */

    if (monthEvents.length === 0) {

        eventList.innerHTML =

            '<div class="calendar-empty">' +

                '<div class="calendar-empty-icon">' +
                    '📅' +
                '</div>' +

                '<h3>' +
                    'No events this month' +
                '</h3>' +

                '<p>' +
                    'There are no scheduled events for this month.' +
                '</p>' +

            '</div>';

        return;
    }


    /* ========================================================
       EVENT LIST
       ======================================================== */

    eventList.innerHTML =

        monthEvents
            .map(function (event) {

                return (

                    '<div class="event-row">' +

                        '<div class="event-row-info">' +

                            '<strong>' +
                                escapeCalendarHtml(
                                    event.title
                                ) +
                            '</strong>' +

                            '<span>' +

                                formatCalendarDate(
                                    event.date
                                ) +

                                ' · ' +

                                escapeCalendarHtml(
                                    event.type
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>'
                );

            })
            .join("");
}


/* ============================================================
   PREVIOUS MONTH
   ============================================================ */

if (previousButton) {

    previousButton.onclick =
        function () {

            current.setMonth(
                current.getMonth() - 1
            );

            renderCalendar();
        };
}


/* ============================================================
   NEXT MONTH
   ============================================================ */

if (nextButton) {

    nextButton.onclick =
        function () {

            current.setMonth(
                current.getMonth() + 1
            );

            renderCalendar();
        };
}


/* ============================================================
   REFRESH WHEN ANNOUNCEMENTS CHANGE
   ============================================================ */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            ANNOUNCEMENT_STORAGE_KEY
        ) {

            renderCalendar();
        }

    }
);


/* ============================================================
   REFRESH WHEN RETURNING TO PAGE
   ============================================================ */

document.addEventListener(
    "visibilitychange",
    function () {

        if (!document.hidden) {

            renderCalendar();
        }

    }
);


/* ============================================================
   INITIALIZE
   ============================================================ */

renderCalendar();