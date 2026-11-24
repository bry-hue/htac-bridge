HTAC CONNECT - GOOGLE SHEETS SHARED DATA EDITION
================================================

WHAT IS INCLUDED
- Existing HTML pages, CSS, images, resources, and page scripts.
- Google Apps Script backend source: Code.gs.
- js/shared-data.js to load shared data before page scripts and sync supported localStorage datasets.
- Responsive calendar event-title overflow fix for cellphone widths.
- Existing page-level admin interfaces retained.

IMPORTANT: FINISH THE GOOGLE APPS SCRIPT SETUP
1. Open the Google Sheet used by HTAC Connect.
2. Choose Extensions > Apps Script.
3. Replace the contents of Code.gs with the Code.gs included in this ZIP.
4. Change HTAC_ADMIN_PIN from CHANGE-THIS-PIN to a private PIN.
5. In the existing client scripts, change ADMIN_PIN in js/announcements.js, js/faculty.js, and js/research-team.js to the same PIN. Do not use 1234 in production.
6. Save, then Deploy > Manage deployments > Edit > New version > Deploy.
7. Keep the deployment URL in js/shared-data.js at API_URL. It is currently set to the /exec URL supplied in the project conversation; if you create a new deployment, replace it with the new /exec URL.
8. Test /exec (should show the API running message) and /exec?action=getAll (JSONP is used by the site).

SHEETS
- Announcements uses the existing tab and columns: ID, Title, Content, Date, Category, CreatedAt, ShowOnCalendar. The API adds ShowOnCalendar if it rewrites the tab.
- Faculty, Ratings, and Comments tabs are created automatically when needed.

DATA AND ADMIN NOTES
- Announcements and faculty writes require the PIN checked server-side by Apps Script.
- Ratings/comments are public submissions and are stored as shared arrays. Protect the spreadsheet itself; do not grant public edit access to it.
- The current client-side admin PIN is still visible in public JavaScript and is not, by itself, secure. The server-side check is the meaningful protection for announcements/faculty writes. Change the PIN in all three client files and in Code.gs.
- The website keeps a local cache for fallback and migration. Existing local data is preserved when the shared dataset is empty; after the administrator saves data, the shared sheet should become the common source. Check your original browser for existing localStorage data before clearing browser data.
- Google Apps Script web apps may need authorization by the owner. Use Execute as Me and public access only if allowed by the school's Google account policies.
- Google Sheets has per-cell size limits. Large faculty photo data URLs may exceed cell limits; use reasonably sized/compressed images or use the existing image files hosted in the site repository for faculty photos.

TESTING CHECKLIST
1. Load announcements.html and calendar.html. Verify announcements show in both places.
2. Sign in to announcements admin, add/edit an announcement, save, and reload on another device/browser.
3. Add/edit a faculty member and verify after reloading.
4. Submit a research rating/comment and verify it appears on another device.
5. Test calendar on a phone-sized viewport with a long announcement title; the grid should not widen and full event details remain in the event list.

This package is a source update. Deploy the included Code.gs to Apps Script and publish the updated website files to GitHub Pages before expecting shared data to work online.
