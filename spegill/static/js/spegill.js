var Persona = Backbone.Model.extend({});

window.persona = new Persona();
window.expected_intent = "";
window.face_id_list = [];
window.maxFacesPerPerson = 100;
window.current_dump = [];

persona.on('change:political', function(model, name) {
    nextTask();
});
persona.on('change:country', function(model, name) {
    nextTask();
});
persona.on('change:color', function(model, name) {
    nextTask();
});
persona.on('change:name', function(model, name) {
    nextTask();
});

function getUserDump() {
    var userDict = {
        "age": persona.get("age"),
        "gender": persona.get('gender'),
        "race": persona.get('race'),
        "glass": persona.get('glass'),
        "smiling": persona.get('smiling'),

        "country": persona.get("country"),
        "political": persona.get("political"),
        "color": persona.get("color"),
        "name": persona.get("name")
    };
    var userDump = JSON.stringify(userDict);
    return userDump;
}


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
        console.log(fullText);
        if (expected_intent == "political") {
            // send to indico
            $.ajax({
                method: "POST",
                url: "/text_data",
                data: {"text": fullText, "action": "political"},
            }).done(function (data) {
                changeText("Sounds like you're a " + data + "?");
                expected_intent = "";
                setTimeout(function () {
                    persona.set("political", data);
                }, 3600);
            });
        }
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
            case "color":
                try {
                    persona.set("color", entities.color.value);
                }
                catch (err) {
                    changeText("Hmm. That's a color? :/");
                }
                break;
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
window.missingFaceCount = 0;
window.maxMissingFaceCount = 20;
window.stfu = false;
window.r = $("#results");
window.tasks = [
    "name",
    "country",
    "political",

    "color",
    "thanks"
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
        case "name":
            changeText("My name is Spegill. What's your name?");
            break;
        case "country":
            changeText("Oh, hey " + persona.get("name") + "! What country are you from?");
            break;
        case "political":
            changeText("Woah! "+ persona.get("country") + " is a great country! My uncle was from " + persona.get("country") + ".");
            setTimeout(function () {
                changeText("I'm actually from America, though. What do you think the U.S should change?");
                expected_intent = "political";
            }, 6500);
            break;
        case "color":
            changeText("What is your favorite color?");
            break;
        case "thanks":
            var color = persona.get("color");
            changeText("I love " + color + "! It was great talking to you! I hope we'll see each other in the future. I'll certainly remember your face! ;)");
            $("body").css("background-color", color);
            $.ajax({
                method: "POST",
                url: "/image_create_person",
                data: {"face_id_list": JSON.stringify(face_id_list.slice(0, maxFacesPerPerson))},
                dataType: "json"
            }).done(function (data) {
                var userDump = getUserDump();
                $.ajax({
                    method: "POST",
                    url: "/update_user_data",
                    data: {"person_id": data.person_id, "user_dump": userDump},
                });
                console.log("Saved user as");
                console.log(data);
            });
            break;
    }
    tasks.shift();
}
window.advertisementNumber = 0;
function nextAdvertisement(data) {
    var advertisement = "";
    switch (advertisementNumber) {
        case 0:
            advertisement = "Are you a(n) " + " " + data.race + " " + data.gender + "? We are filming a movie in your area and looking for candidates like you. Contact us today!";
            break;
        case 1:
            advertisement = "Do you miss " + data.country + "? Go back to your home land for only $666";
            break;
        case 2:
            advertisement = "For a limited time " + data.color + " headphones are on sale for $55, exclusive to Spegill users!";
            break;
        case 3:
            advertisement = "Are you a " + data.political + "? Join your local " + data.political + " political group and participate in civics!";
            break;
        case 4:
            advertisementNumber = -1;
            advertisement = "This billboard is powered by Spegill.";
            break;
    }
    changeText(advertisement);
    advertisementNumber++;

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
        }).done(function (data_raw) {
            var data = JSON.parse(data_raw.o);
            var file_hash = data_raw.ha;
            var faceAttributes = data.face;
            if (faceAttributes.length === 0) {
                missingFaceCount++;
                if ((missingFaceCount > maxMissingFaceCount) && (stfu !== true)) {
                    changeText("Goodbye! See you later.");
                    setTimeout(function () {
                        r.text("Welcome to Spegill! Please look at the camera to continue. One person at a time, please.");
                    }, 2000);
                    stfu = true;
                }
                resetPersona();
                return;
            }
            if (faceAttributes.length > 1) {
                changeText("Only one person at a time should be in the frame.");
            }
            var face_id = faceAttributes[0].face_id;
            face_id_list.push(face_id);
            // check if we recognise this person's face
            $.ajax({
                method: "POST",
                url: "/image_recog_person",
                data: {"data_hash": file_hash},
                dataType: "json"
            }).done(function (data) {
                // receive user information
                if (data.name == current_dump.name) {
                    console.log("same person, skipping");
                    return;
                }
                window.current_dump = data;
                $("#microphone").hide();
                changeText("Hey, " + data.name + ", how is it going?");
                $("body").css("background-color", data.color);
                setInterval(function () {
                    // changeText("You're a(n) " + data.political + " "+ data.race + " " + data.gender + " who is from "+ data.country);
                    nextAdvertisement(data);
                }, 8000);
                console.log(current_dump);
            });

            stfu = false;
            missingFaceCount = 0;
            faceAttributes = faceAttributes[0].attribute;
            if (!persona.get("age")) {
                persona.set("age", faceAttributes.age.value);
                persona.set('gender', faceAttributes.gender.value);
                persona.set('race', faceAttributes.race.value);
                persona.set('glass', faceAttributes.glass.value);
                persona.set('smiling', faceAttributes.smiling.value);
            }
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
