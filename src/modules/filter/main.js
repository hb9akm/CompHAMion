/**
 * <hb9akm-filter page="relais" filters="repeater-voice" collapsed></hb9akm-filter>
 */
class hb9akmFilterElement extends HTMLElement {

    constructor() {
        super();
        let tmpl = document.querySelector("template#hb9akm-filter-element").content.cloneNode(true);

        let shadowRoot = this.attachShadow({mode: "open"});
        Object.defineProperty(
            this,
            "shadowRoot",
            {
                get: function() {
                    return shadowRoot;
                }
            }
        );
        shadowRoot.appendChild(tmpl);
        
        const fixThis = this;
        shadowRoot.addEventListener("change", function(event) {
            shadowRoot.querySelectorAll("fieldset legend input").forEach(function(el) {
                if (el != event.target) {
                    return;
                }
                el.parentElement.parentElement.querySelectorAll("div.filter-section input").forEach(function(input) {
                    input.checked = el.checked;
                    let idParts = input.getAttribute("id").split("_");
                    hb9akm.filter._filterStates[idParts[1]][idParts[2]][idParts[3]] = input.checked;
                });
                let idParts = el.getAttribute("id").split("_");
                hb9akm.filter._callbacks[idParts[1]].forEach(function(callback) {
                    document.querySelectorAll("hb9akm-filter").forEach(function(el) {
                        if (el == fixThis) {
                            return;
                        }
                        el.update();
                    });
                    callback(el);
                });
            });
            shadowRoot.querySelectorAll("fieldset .filter-section input").forEach(function(el) {
                if (el != event.target) {
                    return;
                }
                if (el.checked) {
                    el.parentElement.parentElement.querySelector("legend input").checked = true;
                }
                let idParts = el.getAttribute("id").split("_");
                hb9akm.filter._filterStates[idParts[1]][idParts[2]][idParts[3]] = el.checked;
                if (!hb9akm.filter._callbacks[idParts[1]]) {
                    return;
                }
                hb9akm.filter._callbacks[idParts[1]].forEach(function(callback) {
                    document.querySelectorAll("hb9akm-filter").forEach(function(el) {
                        if (el == fixThis) {
                            return;
                        }
                        el.update();
                    });
                    callback(el);
                });
            });
        });

        shadowRoot.querySelector("section.filter").classList.add(this.page);
        shadowRoot.querySelector("section.filter>legend").addEventListener("click", function(e) {
            if (shadowRoot.querySelector("section.filter").classList.contains("collapsed")) {
                shadowRoot.querySelector("section.filter").classList.remove("collapsed");
            } else {
                shadowRoot.querySelector("section.filter").classList.add("collapsed");
            }
            e.preventDefault();
        });
        this.collapsed = this.collapsed;
        this.update();
    }

    get page() {
        return this.getAttribute("page");
    }

    set page(page) {
        if (page) {
            this.setAttribute("page", page);
        } else {
            this.removeAttribute("page");
        }
    }

    get filters() {
        return this.getAttribute("filters").split(" ");
    }

    set filters(filters) {
        if (filters) {
            this.setAttribute("filters", filters.join(" "));
        } else {
            this.removeAttribute("filters");
        }
    }

    get collapsed() {
        return this.hasAttribute("collapsed");
    }

    set collapsed(collapsed) {
        if (collapsed) {
            this.shadowRoot.querySelector("section.filter").classList.add("collapsed");
            this.setAttribute("collapsed", "");
        } else {
            this.shadowRoot.querySelector("section.filter").classList.remove("collapsed");
            this.removeAttribute("collapsed");
        }
    }
    
    update() {
        const fixThis = this;
        this.shadowRoot.querySelector("section div").innerHTML = "";
        Object.keys(hb9akm.filter._filters).forEach(function(key) {
            var hasActiveFilter = false;
            const filter = hb9akm.filter._filters[key];
            let tmpl = document.querySelector("template#hb9akm-filter-element-filter").content.cloneNode(true);
            tmpl.querySelector("label").innerHTML = filter.label;
            tmpl.querySelector("fieldset").setAttribute("id", "filter_" + filter.name);
            tmpl.querySelector("input").setAttribute("id", "filter_" + filter.name + "_selector");
            tmpl.querySelector("label").setAttribute("for", "filter_" + filter.name + "_selector");
            filter.sections.forEach(function(section) {
                let sectionTmpl = document.querySelector("template#hb9akm-filter-element-filter-section").content.cloneNode(true);
                sectionTmpl.querySelector(".filter-section-label").innerHTML = section.label + ":";
                Object.keys(section.values).forEach(function(key) {
                    let value = section.values[key];
                    let id = "filter_" + filter.name + "_" + section.name + "_" + key;
                    sectionTmpl.querySelector(".filter-section").setAttribute("id", "filter_" + filter.name + "_" + section.name);
                    let inputEl = document.createElement("input");
                    inputEl.setAttribute("type", "checkbox");
                    inputEl.setAttribute("id", id);
                    if (hb9akm.filter._filterStates[filter.name][section.name][key]) {
                        inputEl.setAttribute("checked", "checked");
                        hasActiveFilter = true;
                    }
                    sectionTmpl.querySelector(".filter-section").appendChild(inputEl);
                    sectionTmpl.querySelector(".filter-section").insertAdjacentHTML(
                        "beforeend",
                        '<label for="' + id +'">' + value + '</label>'
                    );
                });
                tmpl.querySelector("fieldset").appendChild(sectionTmpl);
            });
            tmpl.querySelector("legend input").checked = hasActiveFilter;
            fixThis.shadowRoot.querySelector("section div").appendChild(tmpl);
        });
    }
}
hb9akm.filter = {
    _hasCSS: false,
    _hasHTML: true,
    _onload: function() {
        window.customElements.define("hb9akm-filter", hb9akmFilterElement);
    },
    _filters: {},
    _filterStates: {},
    _callbacks: {},
    add: function(filter) {
        if (hb9akm.filter._filters[filter.name]) {
            return;
        }
        hb9akm.filter._filters[filter.name] = filter;
        hb9akm.filter._filterStates[filter.name] = {};
        filter.sections.forEach(function(section) {
            hb9akm.filter._filterStates[filter.name][section.name] = {};
            Object.keys(section.values).forEach(function(key) {
                hb9akm.filter._filterStates[filter.name][section.name][key] = true;
            });
        });
        document.querySelectorAll("hb9akm-filter").forEach(function(el) {
            el.update();
        });
    },
    registerCallback: function(filterName, callback) {
        if (!hb9akm.filter._callbacks[filterName]) {
            hb9akm.filter._callbacks[filterName] = [];
        }
        hb9akm.filter._callbacks[filterName].push(callback);
    },
    getFilterSectionStatus: function(filterName, filterSectionName) {
        return hb9akm.filter._filterStates[filterName][filterSectionName];
    },
    setFilterSectionStatus: function(filterName, filterSectionName, status) {
    }
}
