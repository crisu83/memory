(function() {
    //if (typeof window.DOMParser === 'undefined') {
        /**
         * Creates a new DOM parser
         * @constructor
         */
        var DOMParser = function () {};

        /**
         * Parses the given string
         * @param {string} string
         */
        DOMParser.prototype.parseFromString = function (string) {
            return new DOMObject(JSON.parse(string));
        };

        /**
         * Creates a new DOM object
         * @constructor
         */
        var DOMObject = function (json) {
            var attributes = new DOMAttributes();
            for (var prop in json) {
                if (json.hasOwnProperty(prop)) {
                    attributes.add(prop, json[prop]);
                }
            }
            this.attributes = attributes;
            this.length = Object.keys(this.attributes).length;
        };

        /**
         * Returns all the elements with the given tag name
         * @param {string} name
         */
        DOMObject.prototype.getElementsByTagName = function (name) {
            if (this.attributes[name]) {
                return Array.isArray(this.attributes[name])
                    ? this.attributes[name]
                    : [this.attributes[name]]
            } else {
                return [];
            }
        };

        // Add a reference to the document.
        DOMObject.prototype.documentElement = document;

        /**
         * Creates a new set of DOM attributes.
         * @constructor
         */
        DOMAttributes = function () {};

        /**
         * Adds an element to the attributes.
         * @param {string} key
         * @param {Object} value
         */
        DOMAttributes.prototype.add = function(key, value) {
            if (typeof value === 'object' && value !== null) {
                this[key] = Array.isArray(value)
                    ? value.map(function (data) { return new DOMObject(data); })
                    : new DOMObject(value);
            } else {
                this[key] = value;
            }
        };

        /**
         * Returns the item with the given name or null if the item is not found.
         * @param {string} name
         * @returns {{nodeValue: (Object|null)}}
         */
        DOMAttributes.prototype.getNamedItem = function (name) {
            return {
                nodeValue: this[name] || null
            };
        };

        window.DOMParser = DOMParser;
    //}
})();
