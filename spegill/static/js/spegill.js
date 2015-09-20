function resetPersona() {
    window.age = 0;
    window.gender = "";
    window.race = "";
    window.glass = "";
    window.smiling = 0;
}
resetPersona();
window.missingFaceCount = 0;
window.maxMissingFaceCount = 4;
window.stfu = false;
window.r = $("#results");
window.tasks = [
    "say hello",
    "ask name",
    "save user"
];

Webcam.set({
    width: 320,
    height: 240,
    image_format: 'jpeg',
    jpeg_quality: 90,
    flip_horiz: true
});
Webcam.attach('#camera');

function getCurrentText() {
    return r.text();
}

function changeText(newText, repeat) {
    repeat = repeat || false;
    var currentText = r.text();
    if (currentText == newText) {
        return;
    }

    r.fadeOut(function () {
        r.text(newText);
        r.fadeIn(function () {
            responsiveVoice.speak(newText);
            return;
        });
    });
}
function nextTask() {
    switch(tasks[0]) {
        case "hello":
            changeText("hello");
            break;
    }
    tasks.shift();
}

function sendSnapshot() {
    // take snapshot and get image data
    Webcam.snap(function(data_uri) {
        // display results in page
        $.ajax({
            method: "POST",
            url: "/image_data",
            data: {"b64_image": data_uri},
            dataType: "json"
        }).done(function (data) {
            console.log(data);
            var faceAttributes = data.face;
            if (faceAttributes.length === 0) {
                missingFaceCount++;
                if ((missingFaceCount > maxMissingFaceCount) && (stfu != true)) {
                    changeText("Goodbye! See you later.");
                    setTimeout(function () {
                        r.text("Welcome to Spegill! Please look at the camera to continue. One person at a time, please.");
                    }, 2000);
                    stfu = true;
                }
                resetPersona();
                return;
            }
            if (faceAttributes > 1) {
                changeText("Only one person at a time should be in the frame.");
            }

            stfu = false;
            missingFaceCount = 0;
            faceAttributes = faceAttributes[0].attribute;
            age = faceAttributes.age.value;
            gender = faceAttributes.gender.value;
            race = faceAttributes.race.value;
            glass = faceAttributes.glass.value;
            smiling = faceAttributes.smiling.value;

            nextTask();
        });
    });
}
Webcam.on("live", function () {
    $("#cameraNotice").hide();
    changeText("Hello there!");
    setInterval(function () {
        sendSnapshot();
    }, 2500);
});
