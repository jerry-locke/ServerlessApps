var request = require('request');

module.exports = function (context, req) {
    var roomIdQry = req.query.room;
    var roomIds = roomIdQry.split("-");
    var color = req.body.status == 'Activated' ? 'red' : 'green';
    var style = req.body.status == 'Activated' ? 'lozenge-error' : 'lozenge-success';
    var alertType = req.body.status == 'Activated' ? 'Failed' : 'Succeeded';
    var successImagesArray = [];
    var failedImagesArray = [];
    
    var successNum = Math.floor(Math.random() * successImagesArray.length);
    var failedNum = Math.floor(Math.random() * failedImagesArray.length);
    var alertImage = req.body.status != 'Activated' ? successImagesArray[successNum] : failedImagesArray[failedNum];
    var style_default = 'lozenge-complete'
    var local_context = req.body.context;
    var local_condition = local_context.condition;
    var conditionType = local_context.conditionType;
    var resourceName = local_context.resourceName;
    var resourceGroupName = local_context.resourceGroupName;
    var portalLink = local_context.portalLink;

    context.log('sucessNum: ' + successNum);
    context.log('failedNum: ' + failedNum);

    var portalLinkHTML = '<a href="' + portalLink + '" >View application in Azure Portal</a>';

    var card_title = resourceName + ' ' + conditionType + ' ' + alertType;
    var cardHeading = '<strong>' + local_condition.timeAggregation + ' ' + local_condition.metricName + ' is ' + local_condition.metricValue + ': within threshold for ' + local_condition.windowSize + ' ' + local_condition.metricUnit + '</strong>';
    if (local_condition.timeAggregation == "Sum") {
        cardHeading = '<strong>' + local_condition.metricValue + ' of ' + local_condition.windowSize + ' ' + local_condition.metricName + '. Threshold is set to: ' + local_condition.threshold + '</strong>';
    }


    var messageBody = '<b><span style=\"color:' + color + '\">' + card_title + '</span></b>';
    messageBody += '<p><strong>' + local_condition.timeAggregation + ' ' + local_condition.metricName + ' is ' + local_condition.metricValue + ': within threshold for ' + local_condition.windowSize + ' ' + local_condition.metricUnit + '</strong></p>';
    messageBody += '<p>' + portalLinkHTML + '</p>';
    context.log(req.query);

    context.log('request is: ' + JSON.stringify(req.body, null, 4));
    context.log(roomIds);
    for (roomIdx in roomIds) {
        var options = {
            method: 'POST',
            url: 'https://api.hipchat.com/v2/room/' + roomIds[roomIdx] + '/notification',
            qs: { auth_token: '1y3w6m3kFJQCYOFQH2zGgAtdvb8kjHtwTe30xucH' },
            headers:
            { 'content-type': 'application/json' },
            body: {
                'message': messageBody,
                'message_format': 'html',
                'color': color,
                'notify': true,
                'card': {
                    "style": "application",
                    "url": portalLink,
                    "format": "medium",
                    "id": "db797a68-0aff-4ae8-83fc-2e72dbb1a707",
                    "title": card_title,
                    "description": {
                        "format": "html",
                        "value": cardHeading
                    },
                    "thumbnail": {
                        "url": alertImage,
                        "height": 10
                    },

                    "icon": {
                        "url": "https://azure.microsoft.com/svghandler/application-insights/"
                        //"url": alertImage
                    },
                    "activity": {
                        "html": '<b>' + card_title + '<p>' + cardHeading + '</p></b>'
                    },
                    "attributes": [
                        {
                            "label": "Application",
                            "value": {
                                "label": local_context.name,
                                "style": style
                            }
                        },
                        {
                            "label": "Subscription",
                            "value": {
                                "label": local_context.subscriptionId,
                                "style": style_default
                            }
                        },
                        {
                            "label": "Resource Group:",
                            "value": {
                                "label": resourceGroupName,
                                "style": style_default
                            }
                        }
                    ]
                }
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
        });
    };
    context.done();
};
