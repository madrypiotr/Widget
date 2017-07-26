//## Methods for adding members to Implementing Teams and creating I.T.

isUserCountInImplemTeamNotification = function(id, teamTab, numberOfMembers) {
	// 
	if (teamTab.length == 3) {
		var astatement = TAPi18n.__('txv.ITS_ALREADY') + numberOfMembers + TAPi18n.__('txv.MEMBERS_OF_IMPL_TEAM');
		GlobalNotification.error({
			title: TAPi18n.__('txv.ERROR'),
			content: astatement,
			duration: 10
		});
		return true;
	}
	return false;
};

addMemberToImplemTeamNotification = function(idUser, zespolToUpdate, numberOfMembers, zespolId) {
	// 
	if (zespolToUpdate.length == 2) {
		// I check if we have such a band with another member going
		zespolToUpdate.push(idUser);
		var kwestie = Kwestia.find({
			$where: function() {
				return (this.status == KWESTIA_STATUS.GLOSOWANA || this.status == KWESTIA_STATUS.ARCHIWALNA);
			}
		});
		var flag = false;
		var arrayZespolyDouble = [];
		kwestie.forEach(function(kwestia) {
			// we find Teams
			var zespol = aImplemTeam.findOne({
				_id: kwestia.idaImplemTeam
			});
			if (zespol) {
				var i = 0;
				_.each(zespol.zespol, function(teamItem) {
					// for each current item from the current team
					if (_.contains(zespolToUpdate, teamItem)) {
						// if the database contains an array from the Team
						i++;
					}
				});
				if (i == zespol.zespol.length) {
					arrayZespolyDouble.push(zespol._id);
					flag = true;
					// It may happen that there will be several teams with the same composition, so let's put them on the board
				}
			}
		});
		if (flag == true) {
			Session.setPersistent("zespolRealizacyjnyDouble", arrayZespolyDouble);
			$("#decyzjaModalId").modal("show");
		} else {
			// The third has been added to the Team of Executives. We already have a set
			astatement = TAPi18n.__('txv.ADDED_TO_THE_IT_WE_HAVE_ALREADY_SET');
			$("#addNazwa").modal("show");
			GlobalNotification.success({
				title: TAPi18n.__('txv.SUCCESS'),
				content: astatement,
				duration: 10
			});
			return true;
		}
	} else {
		var text = null;
		if (numberOfMembers == 0) text = TAPi18n.__('txv.MEMBER');
		else text = TAPi18n.__('txv.MEMBERS');
		var astatement = TAPi18n.__('txv.ADDED_TO_THE_IT_NEED_MORE') + numberOfMembers + text;
		zespolToUpdate.push(idUser);
		Meteor.call('updateCzlonkowieZR', zespolId, zespolToUpdate, function(error) {
			if (error) {
				if (typeof Errors === "undefined") Log.error(TAPi18n.__('txv.ERROR') + error.reason);
				else {
					throwError(error.reason);
				}
			} else {
				GlobalNotification.success({
					title: TAPi18n.__('txv.SUCCESS'),
					content: astatement,
					duration: 10
				});
				return true;
			}
		});
	}
};

isUserInaImplemTeamNotification = function(id, teamTab) {
	// information about adding to the Team
	if (_.contains(teamTab, id)) {
		GlobalNotification.error({
			title: TAPi18n.__('txv.ERROR'),
			content: TAPi18n.__('txv.YOU_ARE_ALREADY_IN_THE_IMP_TEAM'),
			duration: 10
		});
		return true;
	} else return false;
};

bladNotification = function() {
	// to report a mistake
	GlobalNotification.error({
		title: TAPi18n.__('txv.WARNING'),
		content: TAPi18n.__('txv.ERROR'),
		duration: 10
	});
};

isUserInZRNotification = function(idZespolu) {
	// Examination of decision-making power
	var zespol = aImplemTeam.findOne({
		_id: idZespolu
	});
	if (zespol) {
		if (!_.contains(zespol.zespol, Meteor.userId())) {
			GlobalNotification.error({
				title: TAPi18n.__('txv.WARNING'),
				content: TAPi18n.__('txv.THIS_DECISION_MAY_BE_TAKEN_ONLY_MEMBER_OF_THE_TEAM'),
				duration: 10
			});
			return true;
		} else return false;
	}
	return false;
};

addMemberToImplemTeamNotificationNew = function(idUser, zespolToUpdate, numberOfMembers, zespolId) {
	if (zespolToUpdate.length == 2) {
		// I check if we have such a team with another member going, we are looking in the Implementation Team
		zespolToUpdate.push(idUser);
		var flag = false;
		var arrayZespolyDouble = [];
		var zespoly = aImplemTeam.find({
			czyAktywny: true
		});
		if (zespoly) {
			zespoly.forEach(function(zespol) {
				var i = 0;
				_.each(zespol.zespol, function(teamItem) {
					// for each current item from the current team
					if (_.contains(zespolToUpdate, teamItem)) {
						// if the database contains an array from the Team
						i++;
					}
				});
				if (i == zespol.zespol.length) {
					arrayZespolyDouble.push(zespol._id);
					flag = true;
				}
			});
		}
		if (flag == true) {
			// They are so, so we display
			Session.setPersistent("zespolRealizacyjnyDouble", arrayZespolyDouble);
			$("#decyzjaModalId").modal("show");
		}
		// There is no teak in the base, so we add a draft.to finish
		else {
			$("#addNazwa").modal("show");
			// excluded:
			//GlobalNotification.success({
			//    title: 'Sukces',
			//    content: astatement,
			//    duration: 10 // duration the notification should stay in seconds
			//});
			return true;
		}
	} else {
		var text = null;
		if (numberOfMembers == 0 || numberOfMembers == 2) text = TAPi18n.__('txv.MEMBER');
		else text = TAPi18n.__('txv.MEMBERS');
		var astatement = TAPi18n.__('txv.ADDED_TO_THE_IT_NEED_MORE') + numberOfMembers + text;
		zespolToUpdate.push(idUser);
		Meteor.call('updateCzlonkowieZRDraft', zespolId, zespolToUpdate, function(error) {
			if (error) {
				if (typeof Errors === "undefined") Log.error(TAPi18n.__('txv.ERROR') + error.reason);
				else {
					throwError(error.reason);
				}
			} else {
				GlobalNotification.success({
					title: TAPi18n.__('txv.SUCCESS'),
					content: astatement,
					duration: 10
				});
				return true;
			}
		});
	}
};

getCzlonekFullName = function(number, idZR, ZRType) {
	// Team Member data
	var userID = getZRData(number, idZR, ZRType);
	if (userID) {
		var user = Users.findOne({
			_id: userID
		});
		if (user.profile) {
			return user.profile.fullName;
		}
	}
};

getZRData = function(number, idZR, ZRType) {
	// Recognizing the status of the Implementation team
	var z = null;
	if (ZRType == "ZRDraft") z = ImplemTeamDraft.findOne({
		_id: idZR
	});
	else z = aImplemTeam.findOne({
		_id: idZR
	});
	if (z) {
		zespolId = z._id;
		var zespol = z.zespol;
		if (zespol) {
			var id = zespol[number];
			return id ? id : null;
		}
	}
};

checkIfInZR = function(idZR, idMember) {
	// Decision on participation or exit from the Implementation Team
		var z = ImplemTeamDraft.findOne({
			_id: idZR
		});
		if (z) {
			return _.contains(z.zespol, idMember) ? idMember : null;
		}
	},
	rezygnujZRAlert = function(idUserZR, idKwestia) {
		bootbox.dialog({
			title: TAPi18n.__('txv.YOU_ARE_A_MEMBER_OF_THIS_WORKING_GROUP'),
			message: TAPi18n.__('txv.DO_YOU_WANT_TO_BE_OR_OUTPUT'),
			buttons: {
				success: {
					label: TAPi18n.__('txv.RESIGNS'),
					className: "btn-success successGiveUp",
					callback: function() {
						$('.successGiveUp').css("visibility", "hidden");
						rezygnujZRFunction(idUserZR, idKwestia);
					}
				},
				main: {
					label: TAPi18n.__('txv.REMAIN'),
					className: "btn-primary"
				}
			}
		});
	};

rezygnujZRFunction = function(idUserZR, idKwestia) {
	// Abandonment of functions in the implementation team
	var kwestia = Kwestia.findOne({
		_id: idKwestia
	});
	if (kwestia) {
		var zespol = ImplemTeamDraft.findOne({
			_id: kwestia.idaImplemTeam
		});
		if (zespol) {
			var zespolR = zespol.zespol.slice();
			zespolR = _.without(zespolR, Meteor.userId());
			var ZRDraft = {
				nazwa: "",
				"zespol": zespolR,
				"idZR": null
			};
			$('.successGiveUp').css("visibility", "visible");
			Meteor.call('updateImplemTeamDraft', zespol._id, ZRDraft, function(error) {
				if (error) {
					if (typeof Errors === "undefined") Log.error(TAPi18n.__('txv.ERROR') + error.reason);
					else {
						throwError(error.reason);
					}
				}
			});
		}
	}
};