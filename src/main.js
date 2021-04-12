// Modules!
var hb9akm = {
    module: {
        _loadTemplate: function(name, callback) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "modules/" + name + "/main.html");
            xhr.send(null);

            xhr.onreadystatechange = function() {
                // readyState 4 means the request is done.
                const XHR_DONE = 4;
                const HTTP_OK = 200;
                if (xhr.readyState === XHR_DONE) {
                    if (xhr.status === HTTP_OK) {
                        document.querySelector("#content").insertAdjacentHTML(
                            "afterend",
                            xhr.responseText
                        );
                        callback();
                    }
                }
            };
        },
        _loadScript: function(name, callback) {
            const script = document.createElement("script");
            script.src = "modules/" + name + "/main.js";
            const internalCallback = function() {
                const onFinish = function() {
                    if (hb9akm[name]._onload != undefined) {
                        hb9akm[name]._onload();
                    }
                    callback();
                }
                if (hb9akm[name]._hasHTML) {
                    hb9akm.module._loadTemplate(name, onFinish);
                } else {
                    onFinish();
                }
            };
            script.onreadystatechange = internalCallback;
            script.onload = internalCallback;
            document.head.appendChild(script);
        },
        load: function(name, callback) {
            hb9akm.module._loadScript(name, function() {
                if (hb9akm[name]._hasCSS) {
                    const style = document.createElement("link");
                    style.href = "modules/" + name + "/main.css";
                    style.type = "text/css";
                    style.rel = "stylesheet";
                    style.onreadystatechange = callback;
                    style.onload = callback;
                    document.head.appendChild(style);
                } else if (callback != undefined) {
                    callback();
                }
            });
        },
        _loadAll: function() {
            if (hb9akm.module._i >= hb9akm.module._toLoad.length) {
                if (hb9akm.module._callback != undefined) {
                    hb9akm.module._callback();
                }
                return;
            }
            hb9akm.module.load(hb9akm.module._toLoad[hb9akm.module._i], hb9akm.module._loadAll);
            hb9akm.module._i++
        },
        loadAll: function(names, callback) {
            hb9akm.module._i = 0;
            hb9akm.module._toLoad = names;
            hb9akm.module._callback = callback;
            hb9akm.module._loadAll();
        }
    }
}
document.addEventListener("DOMContentLoaded", function() {
    hb9akm.module.loadAll([
        "messages",
        "ajax",
        "tabs",
        "geo"
    ]);
});
