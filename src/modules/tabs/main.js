hb9akm.tabs = {
    _onload: function() {
        hb9akm.pages = {};
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
        document.querySelectorAll("#content section").forEach(function(el, index) {
            el.style.display = "none";
        });

        const pageName = this.href.split("#")[1];
        document.querySelectorAll("header nav a").forEach(function(el, index) {
            el.classList.remove("active");
        });

        if (hb9akm.tabs.loadedPages[pageName] != undefined) {
            document.querySelector('header nav a[href="#' + pageName + '"]').classList.add("active");
            //document.querySelector("#content").innerHTML = hb9akm.tabs.loadedPages[pageName];
            document.querySelectorAll("#content section." + pageName).forEach(function(el, index) {
                el.style.display = "block";
            });

            if (hb9akm.pages[pageName] && hb9akm.pages[pageName].load != undefined) {
                hb9akm.pages[pageName].load(false);
            }
            return;
        }

        this.classList.add("active");
        hb9akm.ajax.get(
            "pages/" + pageName + "/main.html",
            function(xhr) {
                const callback = function() {
                    if (hb9akm.pages[pageName] && hb9akm.pages[pageName].load != undefined) {
                        hb9akm.pages[pageName].load(true);
                    }
                }
                const script = document.createElement("script");
                script.src = "pages/" + pageName + "/main.js";
                script.onreadystatechange = callback;
                script.onload = callback;
                document.head.appendChild(script);
                if (document.querySelector("#content section")) {
                    document.querySelector("#content section").insertAdjacentHTML(
                        "afterend",
                        xhr.responseText
                    );
                } else {
                    document.querySelector("#content").innerHTML = xhr.responseText;
                }
                const style = document.createElement("link");
                style.href = "pages/" + pageName + "/main.css";
                style.type = "text/css";
                style.rel = "stylesheet";
                document.head.appendChild(style);
                hb9akm.tabs.loadedPages[pageName] = xhr.responseText;
            },
            function(xhr) {
                hb9akm.messages.error(xhr.status);
            }
        );
    }
}
