
window.common = (function () {
    var common = {};

    common.getFragment = function getFragment() {
        return parseQueryString(window.location.search.substr(1));
    };

    function parseQueryString(queryString) {
        var data = {},
            pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

        if (queryString === null) {
            return data;
        }

        pairs = queryString.split("&");

        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            separatorIndex = pair.indexOf("=");

            if (separatorIndex === -1) {
                escapedKey = pair;
                escapedValue = null;
            } else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }

            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);

            data[key] = value;
        }

        return data;
    }

    return common;
})();

var fragment   = common.getFragment();
var soundPrice = 0;

if(window.opener.$windowScope &&
   window.opener.$windowScope.price)
{
    var soundPrice = window.opener.$windowScope.price;
    var itemNumber = window.opener.$windowScope.itemNumber;
    var itemName   = window.opener.$windowScope.itemName;
}
var soundPrice = soundPrice ? soundPrice : 0;

var priceEl        = document.getElementById("price");
var itemNumberEl   = document.getElementById("item_number");
var priceElUi      = document.getElementById("price_ui");
var itemNameEl     = document.getElementById("item_name");

priceEl.value        = soundPrice;
priceElUi.innerHTML  = soundPrice;
itemNumberEl.value   = itemNumber;
itemNameEl.value     = itemName;


