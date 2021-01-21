// Modules!
var hb9akm = {
    module: {
        _loadScript: function(name, callback) {
            const script = document.createElement("script");
            script.src = "modules/" + name + "/main.js";
            const internalCallback = function() {
                if (hb9akm[name]._onload != undefined) {
                    hb9akm[name]._onload();
                }
                callback();
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
        loadAll: function(names) {
            names.forEach(function(name, index) {
                hb9akm.module.load(name);
            });
        }
    }
}
document.addEventListener("DOMContentLoaded", function() {
    hb9akm.module.loadAll([
        // ajax?
        "messages",
        "tabs"
    ]);
});
