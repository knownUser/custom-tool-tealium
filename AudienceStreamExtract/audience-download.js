/* Inital release
build 1.0
*/

window.ssaudiencesDownload = window.ssaudiencesDownload || {

    initialized: false,

    message: {
        'header': '',
        'footer': '<br><p style="">Comments / bugs / feature requests? Open new issue at<a href="https://github.com/knownUser/custom-tool-tealium">MyGithub page</a></p>',
        'namespace': "ssaudiences_download_main",
        data: {
        }
    },

    init: function (tool) {
        if (document.URL.indexOf('my.tealiumiq.com/datacloud') === -1) {
            //this.ui_state('ui_error');
            this.error('Need to be on Tealium Server Side');
            return false;
        }

        switch (tool.command) {
            case "start":
                console.log('inside start');
                this.start();
                break;
            case "run":
                this.makeProgressCircle();
                this.getssAttributes(tool.filter);
                break;
            case "download":
                this.download();
                break;
            case "exit":
                this.exit();
                break;
            default:
                //this.ui_state('ui_error');
                this.error("Unknown command received from Tealium Tool: '" + tool.command + "'")
                break;

        }

        tealiumTools.send(this.message);
    },

    start: function () {
        this.message.exit = false;
        this.ui_state('ui_start');
        this.message.data.account_name = gApp.utils.url.getQueryParamByName("account");
        this.message.data.profile_name = gApp.utils.url.getQueryParamByName("profile");
        this.message.data.headers = ["Audience Name, Conditions"];
        this.message.data.csv = "Audience Name, Conditions\n";
        console.log(this);
    },

    download: function () {
        var b = document.createElement('a'),
            $v,
            csvData = new Blob([this.message.data.csv], {
                type: 'text/csv'
            });
        b.setAttribute("id", "ss_audience_export");
        b.setAttribute("href", URL.createObjectURL(csvData));
        b.setAttribute("download", this.message.data.profile_name + "_ss_audience_export.csv");
        document.body.appendChild(b);
        $v = $.find('#ss_audience_export')[0];
        $v.click();
        $v.remove();
    },

    makeProgressCircle: function (cmd) {
        this.ui_state('ui_wait');
        if (typeof msg !== 'undefined') {
            this.message.data.wait_message = msg;
        }
        tealiumTools.send(this.message);
    },

    getssAttributes: function (filter) {

        var that = this;

        this.makeProgressCircle('Getting all variables in profile: ' + this.message.data.profile_name);

        try {
            var userInput = filter.toLowerCase();
            _.each(gApp.inMemoryModels.audienceCollection.sortBy("name"), function (x) {
                if (x.get('name').toLowerCase().indexOf(userInput) > -1) {
                    that.message.data.csv += x.get('name') + ',';
                    that.message.data.csv += "\"";
                    var condition = JSON.parse(x.attributes.logic);
                    for (var i = 0; i < condition.$or.length; i++) {
                        for (var j = 0; j < condition.$or[i].$and.length; j++) {
                            var operand1 = condition.$or[i].$and[j].operand1.split('.')[1];
                            var audiAttribute = gApp.inMemoryModels.quantifierCollection._byId[operand1]
                            that.message.data.csv += audiAttribute.get('type').displayName.replace(/\n/g, '') + " " + audiAttribute.get('name').replace(/\n/g, '') + " " + condition.$or[i].$and[j].operator + " \n " + ((j + 1 == condition.$or[i].$and.length && i + 1 < condition.$or.length) ? 'OR' : (j + 1 < condition.$or[i].$and.length) ? 'AND' : '');
                            that.message.data.csv += " \n ";
                        }
                    }
                    that.message.data.csv += "\"";
                    that.message.data.csv += "\n";
                }
            });

        } catch (error) {
            this.error('An error occured collecting variable data: ' + error);

        }

        this.ui_state('ui_finish');


    },

    ui_state: function (cmd) {
        var that = this;
        Object.keys(that.message).forEach(function (key, index) {
            if (key.indexOf('ui_') === 0) {
                that.message[key] = false;
            }
        });
        that.message[cmd] = true;
    },

    error: function (msg) {
        this.ui_state('ui_error');
        this.message.data.error_message = msg;
        console.log('Error: ' + msg);
        tealiumTools.send(this.message);
    },

    exit: function () {
        this.message.exit = true;
    }


}

window.ssaudiences_download_main = function (args) {
    return ssaudiencesDownload.init(args);
}

if (!ssaudiencesDownload.initialized) {
    ssaudiencesDownload.initialized = true;
    ssaudiences_download_main({
        command: 'start'
    });
} else {
    if (typeof ssaudiencesDownload.message.ui_finish === 'undefined' || ssaudiencesDownload.message.exit === true) {
        ssaudiences_download_main({
            command: "start"
        });
    }
} 
