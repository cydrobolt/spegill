var Persona = Backbone.Model.extend({
  promptColor: function() {
    var cssColor = prompt("Please enter a CSS color:");
    this.set({color: cssColor});
  }
});

window.persona = new Persona();
window.expected_intent = "";

persona.on('change:name', function(model, name) {
    nextTask();
});

persona.on('change:country', function(model, country) {
    nextTask();
});

var mic = new Wit.Microphone(document.getElementById("microphone"));
    mic.onready = function () {
        console.info("Microphone is ready to record");
    };
    mic.onaudiostart = function () {
        console.info("Recording started");
    };
    mic.onaudioend = function () {
        console.info("Recording stopped, processing started");
    };
    mic.onresult = function (intent, entities, fullText) {
        switch (intent) {
            case "name":
                try {
                    persona.set("name", entities.contact.value);
                }
                catch (err) {
                    changeText("What? What do you mean?");
                }
                break;
            case "location":
                try {
                    persona.set("country", entities.location.value);
                }
                catch (err) {
                    changeText("Hmm. I didn't quite get what country you were referring to.");
                }
                break;
            default:
                if (expected_intent == "political") {
                    // send to indico
                    $.ajax({
                        method: "POST",
                        url: "/speech_data",
                        data: {"text": fullText},
                        dataType: "json"
                    }).done(function () {

                    });
                }
        }

        var r = kv("intent", intent);

        for (var k in entities) {
            var e = entities[k];

            if (!(e instanceof Array)) {
                r += kv(k, e.value);
            } else {
                for (var i = 0; i < e.length; i++) {
                    r += kv(k, e[i].value);
                }
            }
        }

        console.log(r);
  };
  mic.onerror = function (err) {
    console.error("Error: " + err);
  };
  mic.onconnecting = function () {
    console.info("Microphone is connecting");
  };
  mic.ondisconnected = function () {
    console.info("Microphone is not connected");
  };

  mic.connect("V3BCSB5DFN5CCIN6CXWWJAHWIC5XNJMJ");
  function kv (k, v) {
    if (toString.call(v) !== "[object String]") {
        v = JSON.stringify(v);
    }
    return k + "=" + v + "\n";
}

function resetPersona() {
    window.age = 0;
    window.gender = "";
    window.race = "";
    window.glass = "";
    window.smiling = 0;
}

resetPersona();

window.user_name = "";
window.current_task = "";
window.missingFaceCount = 0;
window.maxMissingFaceCount = 20;
window.stfu = false;
window.r = $("#results");
window.tasks = [
    "name",
    "country",
    "political",

    "hobbies",
    // "basketball",
    // "comcast"
];

var generalQ = ["What is your name",
"What country are you from",
"Did you have an idea of what to make at a hackathon",
"How are you feeling about your hack"];


var indicoQ = ["Political Affiliation for Indico",
"Who is your favourite basketball player"];

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
        case "name":
            changeText("My name is Spegill. What's your name?");
            break;
        case "country":
            changeText("Oh, hey " + persona.get("name") + "! What country are you from?");
            break;
        case "political":
            changeText("Woah! "+ persona.get("country") + " is a great country! My uncle was from " + persona.get("country") + ".");
            setTimeout(function () {
                changeText("As 2016 is getting closer, conversations about where America should be going are becoming prevalent. What do you think the U.S should change?");
            }, 3200);
            expected_intent = "political";
            break;
        case "hobbies":
            expected_intent = "";
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
        });
    });
}
Webcam.on("live", function () {
    $("#cameraNotice").hide();
    changeText("Hello there!");
    setInterval(function () {
        sendSnapshot();
    }, 2500);
    setTimeout(function () {
        nextTask();
    }, 2500);
});
