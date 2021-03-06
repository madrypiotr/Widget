'use strict';

var gmapKey = 'AIzaSyB2s36h3R6hAddpvN9TO-tnAzKeoOJkbws';

Parametr.after.insert(function (_id, doc) {
    updateParametrLocation(_id, doc);
});

Parametr.after.update(function (_id, doc, fieldNames) {
    if (fieldNames.indexOf('terytAdres') !== -1 || fieldNames.indexOf('terytCity') !== -1) {
        updateParametrLocation(_id, doc);
    }
});

Meteor.users.after.insert(function (userId, doc) {
    updateUserLocation(userId, doc);
});

Meteor.users.after.update(function (userId, doc, fieldNames) {
    if (fieldNames.indexOf('profile') !== -1) {
        updateUserLocation(userId, doc);
    }
});

Accounts.onCreateUser(function (options, user) {
    if (options.profile) {
        user.profile = options.profile;
    }

    updateUserLocation(user._id, user);

    updateZR(user._id);

    return user;
});

var updateParametrLocation = function (_id, doc) {
    var city    = doc.terytCity;
    var address = doc.terytAdres;
    var zip     = doc.terytCODE;

    getLocation(city, address, zip, function (location) {
        Parametr.direct.update(_id, {
            $set: {
                terytLocation: location
            }
        });
    });
};

var updateUserLocation = function (userId, doc) {
    var city    = doc.profile && doc.profile.city;
    var address = doc.profile && doc.profile.address;
    var zip     = doc.profile && doc.profile.zip;

    getLocation(city, address, zip, function (location) {
        Meteor.users.direct.update(userId, {
            $set: {
                'profile.location': location
            }
        });
    });
};

var getLocation = function (city, address, zip, callback) {
    if (!zip) {
        return;
    }

    var search = encodeURIComponent('Polska,' + zip); //encodeURIComponent(city + ', ' + address);
    var options = {url: 'https://maps.google.com/maps/api/geocode/json?address=' + search + '&key=' + gmapKey + '&language=pl', include: false};

    Curl.request(options, function (err, parts) {
        var result, retLocation;
        try {
            parts = parts.split('\r\n');
            var data = parts.pop();
            var jsonData = JSON.parse(data);
            result = jsonData.results[0];
            retLocation = result.geometry.location;
        } catch (error) {
            console.error('getCityCoordinates error', options, error, result);
        }

        if (retLocation) {
            callback(retLocation);
        }
    });
};

Meteor.startup(function () {
    UniConfig.private.runOnce('updateLocationForUsers', function () {
        Meteor.users.find({'profile.location': {$exists: false}}).forEach(function (user) {
            updateUserLocation(user._id, user);
        });
    });
});

Meteor.startup(function () {
    UniConfig.private.runOnce('updateLocationForParameters', function () {
        Parametr.find({terytLocation: {$exists: false}}).forEach(function (parametr) {
            updateParametrLocation(parametr._id, parametr);
        });
    });
});

const ZROsobowyId = 'jjXKur4qC5ZGPQkgN';
var updateZR = userId => {
    const zr = ZespolRealizacyjny.findOne(ZROsobowyId);

    if (zr && zr.zespol.length < 3) {
        ZespolRealizacyjny.update(ZROsobowyId, {
            $addToSet: {zespol: userId}
        });
    }

    ImplemTeamDraft.find({idZR: ZROsobowyId}).forEach(zrDraft => {
        ImplemTeamDraft.update(zrDraft._id, {
            $addToSet: {zespol: userId}
        });
    });
};
