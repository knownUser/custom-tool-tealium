(function() {
    var type = {
        cp: "First Party Cookie",
        js: "UDO Variable",
        js_page: "JavaScript Variable",
        meta: "Meta Data Element",
        qp: "Querystring Parameter"
    };
    var output = "";
    for (i in utui.data.define) {
        if (utui.data.define[i].type != "va") {
            output += '"' + utui.data.define[i].name + '","';
            for (t in type) {
                if (t == utui.data.define[i].type) {
                    output += type[t] + '","';
                }
            }
            output += utui.data.define[i].title + '","';
            output += utui.data.define[i].description + '"\n';
        }
    }
    console.log(output);
})();
