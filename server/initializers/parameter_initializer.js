Meteor.startup(function () {
    //console.log("ZMIANA_PARAMS");
    var globalParameters = [
        {
            "nazwaOrganizacji": TXV.ORG_NAME,
            "terytorium": TXV.TERITORY,
            "terytAdres": TXV.TERITADR,
            "terytCODE": TXV.TERITCOD,
            "terytCity": TXV.TERITCITY,
            "kontakty": TXV.CONTACTS,
            "regulamin": txv.MISSING_RULES,
            "czasWyczekiwaniaKwestiiSpecjalnej":1,
            "voteQuantity":3,
            "voteDuration":1,
            "addIssuePause":2,
            "addCommentPause":2,
            "addReferencePause":2,
            "okresSkladaniaRR":2
        }
    ];
    if (Parametr.find().count() == 0) {
        Meteor.call('addParametr', globalParameters, function (error, ret) {
            if (error) {
                if (typeof Errors === "undefined")
                    Log.error(TAPi18n.__('txv.ERROR') + error.reason);
                else {
                    throwError(error.reason);
                }
            }
        });
    }
});
