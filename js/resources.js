// ==========================================
// STUDENT RESOURCES
// ==========================================

var resources = [

    // --------------------------------------
    // Mathematics
    // --------------------------------------

    {
        icon: "📐",
        title: "Grade 12 Mathematics",
        text: "It covers selected topics commonly encountered in senior high school mathematics.",
        file: "data/Grade_12_Mathematics_Study_Reviewer.pdf"
    },

    // --------------------------------------
    // Science
    // --------------------------------------

    {
        icon: "🔬",
        title: "Science",
        text: "Add science learning materials and reference resources here.",
        file: "#"
    },


    // --------------------------------------
    // Research
    // --------------------------------------

    {
        icon: "📝",
        title: "Research",
        text: "Add research guides, templates, formats, and helpful references here.",
        file: "#"
    },


    // --------------------------------------
    // ICT / Technology
    // --------------------------------------

    {
        icon: "💻",
        title: "ICT / Technology",
        text: "Add ICT learning materials, activities, and reference files here.",
        file: "#"
    }

];


// ==========================================
// DISPLAY RESOURCES
// ==========================================

var resourceGrid = document.getElementById("resourceGrid");

if (resourceGrid) {

    resourceGrid.innerHTML = resources
        .map(function (resource) {

            return '<article class="resource-card">' +

                '<div class="resource-icon">' +
                    resource.icon +
                '</div>' +

                '<h2>' +
                    resource.title +
                '</h2>' +

                '<p>' +
                    resource.text +
                '</p>' +

                '<a href="' + resource.file + '" target="_blank">' +
                    'View resources →' +
                '</a>' +

            '</article>';

        })
        .join("");

}

