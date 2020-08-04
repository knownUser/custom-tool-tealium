/* Inital release
*/

window.datalayerDownload = window.datalayerDownload || {

    initialized: false,

    message: {
        data: {
            'header': '',
            'footer': ''
        }
    },

    init: function (tool) {
        if (document.URL.indexOf('my.tealiumiq.com') === -1 || document.URL.indexOf('my.tealiumiq.com') === -1) {
            //this.ui_state('ui_error');
            tealiumTools.sendError('Need to be on TiQ website');
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
                tealiumTools.sendError("Unknown command received from Tealium Tool: '" + tool.command + "'")
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

        this.makeProgressCircle('Getting all variables in accout: ' + this.message.data.account_name);

        try {
            var type = { cp: 'First Party Cookie', js: 'UDO Variable', js_page: 'JavaScript Variable', meta: 'Meta Data Element', qp: 'Querystring Parameter', va: 'AudienceStream' };

            Object.keys(utui.data.define).forEach((key) => {

                var that = utui.data.define[key];

                this.message.data.csv += that._id + ',';
                this.message.data.csv += that.name + ',';
                this.message.data.csv += type[that.type] + ',';
                this.message.data.csv += that[i].title + ',';
                this.message.data.csv += that[i].description + ',';
                this.message.data.csv += that[i].labels;
                this.message.data.csv += '\n';

            });

            Object.keys(utui.config.domDescriptions).forEach((key) => {

                this.message.data.csv += '' + ',' + i + '' + ',' + 'DOM Variable' + ',' + '' + that[i] + ',' + '';

            });

        } catch (error) {
            this.log('An error occured collecting variable data: ' + error);

        }

        this.ui_state('ui_finish');


    },

    ui_state: function (cmd) {
        Object.keys(this.message).forEach(function (key, index) {
            if (key.indexOf('ui_') === 0) {
                this.message[key] = false;
            }
        });
        this.message[cmd] = true;
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
