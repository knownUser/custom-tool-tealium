/* Inital release
build 1.0
*/

window.ssattributesDownload = window.ssattributesDownload || {

    initialized: false,

    message: {
        'header': '',
        'footer': '<br><p style="">Comments / bugs / feature requests? Open new issue at<a href="https://github.com/knownUser/custom-tool-tealium">MyGithub page</a></p>',
        'namespace': "ssattributes_download_main",
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
        this.message.queryParams = new URLSearchParams(window.location.search);
        this.message.data.account_name = this.message.queryParams.get("account");
        this.message.data.profile_name = this.message.queryParams.get("profile");
        this.message.data.headers = ["Attribute Name", "Scope", "Data Type", "Restricted/AudienceDB"];
        this.message.data.csv = this.message.data.headers.join(',') + ',Value Source,Description,Deployed on\n';
        console.log(this);
    },

    download: function () {
        var b = document.createElement('a'),
            $v,
            csvData = new Blob([this.message.data.csv], {
                type: 'text/csv'
            });
        b.setAttribute("id", "ss_attribute_export");
        b.setAttribute("href", URL.createObjectURL(csvData));
        b.setAttribute("download", this.message.data.profile_name + "_ss_attribute_export.csv");
        document.body.appendChild(b);
        $v = $.find('#ss_attribute_export')[0];
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
            var userInput = tealiumTools.input.attributeLabel.toString();
            _.each(gApp.inMemoryModels.quantifierCollection.sortBy("name"), function (x) {
                if (x.get('name').toLowerCase().indexOf(filter) > -1) {
                    that.data.csv += x.get('name') + ',';       //Attribute Name
                    that.data.csv += x.get('context').value + ',';   //Scope
                    that.data.csv += x.get('type').displayName + ','; //DataType
                    that.data.csv += (x.get('audienceDBEnabled') == true ? 'Yes' : 'No') + ','; //Restricted / AudienceDB;
                    that.data.csv += ',';                        //Value Source
                    that.data.csv += x.get('description');    //Description
                    //Deployed on
                    that.data.csv += '\n';

                }
            });

        } catch (error) {
            this.log('An error occured collecting variable data: ' + error);

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

window.ssattributes_download_main = function (args) {
    return ssattributesDownload.init(args);
}

if (!ssattributesDownload.initialized) {
    ssattributesDownload.initialized = true;
    ssattributes_download_main({
        command: 'start'
    });
} else {
    if (typeof ssattributesDownload.message.ui_finish === 'undefined' || ssattributesDownload.message.exit === true) {
        ssattributes_download_main({
            command: "start"
        });
    }
} 
