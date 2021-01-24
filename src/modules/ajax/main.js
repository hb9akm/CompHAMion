hb9akm.ajax = {
    get: function(url, success, error) {
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
    }
}
