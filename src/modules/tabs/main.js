hb9akm.tabs = {
    _onload: function() {
        document.querySelectorAll("header nav a").forEach(function(el, index) {
            el.addEventListener("click", hb9akm.tabs.switchTab, false)
        });
        if (window.location.hash != "") {
            document.querySelector('header nav a[href="' + window.location.hash + '"]').click();
        } else {
            document.querySelector("header nav a").click();
        }
    },
    _getAjax: function(url, success, error) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.send(null);

        xhr.onreadystatechange = function() {
            // readyState 4 means the request is done.
            const XHR_DONE = 4;
            const HTTP_OK = 200;
            if (xhr.readyState === XHR_DONE) {
                if (xhr.status === HTTP_OK) {
                    success(xhr);
                } else {
                    error(xhr);
                }
            }
        };
    },
    loadedPages: {},
    switchTab: function() {
        const pageName = this.href.split("#")[1];
        if (hb9akm.tabs.loadedPages[pageName] != undefined) {
            document.querySelector("#content").innerHTML = hb9akm.tabs.loadedPages[pageName];
            return;
        }
        hb9akm.tabs._getAjax(
            "pages/" + pageName + "/main.html",
            function(xhr) {
                const script = document.createElement("script");
                script.src = "pages/" + pageName + "/main.js";
                document.head.appendChild(script);
                document.querySelector("#content").innerHTML = xhr.responseText;
                const style = document.createElement("link");
                style.href = "pages/" + pageName + "/main.css";
                style.type = "text/css";
                style.rel = "stylesheet";
                document.head.appendChild(style);
                hb9akm.tabs.loadedPages[pageName] = xhr.responseText;
            },
            function(xhr) {
                console.log('Error: ' + xhr.status); // An error occurred during the request.
                hb9akm.messages.error(xhr.status);
            }
        );
    }
}
