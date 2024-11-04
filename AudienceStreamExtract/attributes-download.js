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
        if (document.URL.indexOf('my.tealiumiq.com') === -1 && (document.URL.indexOf('product=SS') === -1)) {
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
                this.getsAttributes(tool.filter);
                break;
            case "aud_run":
                this.makeProgressCircle();
                this.getAudience(tool.filter);
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
        b.setAttribute("download", this.message.data.profile_name + this.message.data.file_name+ "_export.csv");
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

    getsAttributes: function (filter) {

        this.message.data.csv = '';

        this.message.data.headers = ["Attribute Id","Attribute Name", "Scope", "Data Type", "Restricted", "AudienceDB"];
        this.message.data.csv = this.message.data.headers.join(',') + ',Value Source,Description,Deployed on\n';

        var that = this;

        this.makeProgressCircle('Getting all variables in profile: ' + this.message.data.profile_name);

        try {
            var userInput = filter.toLowerCase();
            _.each(gApp.inMemoryModels.quantifierCollection.sortBy("name"), function (x) {
                if (x.get('name').toLowerCase().indexOf(userInput) > -1) {
                    that.message.data.csv += x.get('id') + ',';  //Attribute Id
                    that.message.data.csv += x.get('name') + ',';       //Attribute Name
                    that.message.data.csv += x.get('context').value + ',';   //Scope
                    that.message.data.csv += x.get('type').displayName + ','; //DataType
                    that.message.data.csv += (x.get('isPersonalInfo') ? 'Yes' : 'No') + ','; //Restrcited Data
                    that.message.data.csv += (x.get('audienceDBEnabled') == true ? 'Yes' : 'No') + ','; // AudienceDB;
                    that.message.data.csv += ',';                        //Value Source
                    that.message.data.csv += '"' + x.get('description') + '"';    //Description
                    //Deployed on
                    that.message.data.csv += '\n';

                }
            });

            that.message.data.file_name = 'attributes';

        } catch (error) {
            this.error('An error occured collecting variable data: ' + error);

        }

        this.ui_state('ui_finish');


    },

    getAudience: function (filter) {

        this.message.data.csv = '';

        this.message.data.headers = ["Audience Name, Conditions"];
        this.message.data.csv = "Audience Name, Conditions\n";

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
            that.message.data.file_name = 'audiences';

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
