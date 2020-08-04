/* Inital release
*/

window.datalayerDownload = window.datalayerDownload || {

    initialized: false,

    message: {
        'header': '',
        'footer': '<br><p style="">Comments / bugs / feature requests? Open new issue at<a href="https://github.com/knownUser/custom-tool">MyGithub page</a></p>',
        'namespace': "datalayer_download_main",
         data: {
         }
    },

    init: function (tool) {
        if (document.URL.indexOf('my.tealiumiq.com') === -1 || document.URL.indexOf('my.tealiumiq.com') === -1) {
            //this.ui_state('ui_error');
            this.error('Need to be on TiQ website');
            return false;
        }

        switch (tool.command) {
            case "start":
                this.start();
                break;
            case "run":
                this.makeProgressCircle();
                this.getDatalayerVariables();
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
        this.message.data.account_name = utui.login.account;
        this.message.data.headers = ["Datalayer[ID]", "Variable Name", "Variable Type", "Variable Title"];
        this.message.data.csv = this.message.data.headers.join(',') + ',Variable Description,Variable Label\n';
    },

    download: function () {
        var b = document.createElement('a'),
            $v,
            csvData = new Blob([this.message.data.csv], {
                type: 'text/csv'
            });
        b.setAttribute("id", "datalayer-export");
        b.setAttribute("href", URL.createObjectURL(csvData));
        b.setAttribute("download", this.message.data.account_name + "_mappings_export.csv");
        document.body.appendChild(b);
        $v = $.find('#datalayer-export')[0];
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

    getDatalayerVariables: function () {
        
        var that = this;

        this.makeProgressCircle('Getting all variables in accout: ' + this.message.data.account_name);

        try {
            var type = { cp: 'First Party Cookie', js: 'UDO Variable', js_page: 'JavaScript Variable', meta: 'Meta Data Element', qp: 'Querystring Parameter', va: 'AudienceStream' };

            Object.keys(utui.data.define).forEach((key) => {

                var thatData = utui.data.define[key];

                that.message.data.csv += thatData._id + ',';
                that.message.data.csv += thatData.name + ',';
                that.message.data.csv += type[thatData.type] + ',';
                that.message.data.csv += thatData.title + ',';
                that.message.data.csv += thatData.description + ',';
                that.message.data.csv += thatData.labels;
                that.message.data.csv += '\n';

            });

            Object.keys(utui.config.domDescriptions).forEach((key) => {
                
                var descriptionName = utui.config.domDescriptions[key];
                
                that.message.data.csv += '' + ',' + key + '' + ',' + 'DOM Variable' + ',' + '' + descriptionName + ',' + '';
                that.message.data.csv += '\n';
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
    
     error: function(msg) {
        this.ui_state('ui_error');
        this.message.data.error_message = msg;
        console.log('Error: '+msg);
        tealiumTools.send(this.message);
    },

    exit: function () {
        this.message.exit = true;
    }


}

window.datalayer_download_main = function (args) {
    return datalayerDownload.init(args);
}

if (!datalayerDownload.initialized) {
    datalayerDownload.initialized = true;
    datalayer_download_main({
        command: 'start'
    });
} else {
    if (typeof datalayerDownload.message.ui_finish === 'undefined' || datalayerDownload.message.exit === true) {
        datalayer_download_main({
            command: "start"
        });
    }
} 
