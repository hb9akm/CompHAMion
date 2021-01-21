hb9akm.messages = {
    _hasCSS: true,
    _onload: function() {
        const msg = document.createElement("article");
        msg.id = "message";
        document.querySelector("body").insertBefore(
            msg,
            document.querySelector("body").firstChild
        );
    },
    show: function(message, type) {
        const msg = document.querySelector("#message")
        msg.innerHTML = message;
        msg.classList.add("show");
        msg.classList.remove("error");
        msg.classList.remove("warning");
        msg.classList.remove("info");
        msg.classList.remove("success");
        msg.classList.add(type);

        // todo: if multiple messages are to show this won't work correctly
        setTimeout(
            function() {
                msg.classList.remove("show");
            },
            10000
        );
    },
    error: function(message) {
        hb9akm.messages.show(message, "error");
    },
    warning: function(message) {
        hb9akm.messages.show(message, "warning");
    },
    info: function(message) {
        hb9akm.messages.show(message, "info");
    },
    success: function(message) {
        hb9akm.messages.show(message, "success");
    }
}
