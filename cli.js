var vorpal = require('vorpal')();

vorpal
	.command('check-collector', 'Checks quests.json for collector data')
	.action(function(args, callback) {
		checkCollectorRequirements(args)
		callback();
	});

vorpal
	.command('new-quest-objective-id', 'Checks quests.json for the next objective ID')
	.action(function(args, callback) {
		newObjectiveId(args)
		callback();
	});

vorpal
	.command('new-quest-id', 'Checks quests.json for the next quest ID')
	.action(function(args, callback) {
		newQuestId(args)
		callback();
	});

vorpal
	.command('new-hideout-objective-id', 'Checks hideout.json for the next hideout module objective ID')
	.action(function(args, callback) {
		newHideoutObjectiveId(args)
		callback();
	});

vorpal
	.command('new-hideout-id', 'Checks hideout.json for the next hideout module ID')
	.action(function(args, callback) {
		newHideoutId(args)
		callback();
	});

vorpal
	.command('verify-quest-data', 'Checks quests.json for common mistakes')
	.action(function(args, callback) {
		verifyQuestData(args)
		callback();
	});

vorpal
	.command('verify-hideout-data', 'Checks hideout.js for common mistakes')
	.action(function(args, callback) {
		verifyHideoutData(args)
		callback();
	});

function checkCollectorRequirements(args) {
	var collectorQuests = []
	var highestCollectorLevel = 0
	var debugQuests = require('./quests.json')

	var questDictionaryTitle = debugQuests.reduce((a, x) => ({ ...a,
		[x.title]: x
	}), {})

	// First, filter it down to every quest except collector, nokappa quests, and deprecated quests
	var allQuestsButCollector = debugQuests.filter(x => x.id != 195 && x.deprecated != true && x.nokappa != true)

	console.log(`Collector currently requires ${allQuestsButCollector.length} quests`)

	// Next, get an array of all required quests
	var allRequiredQuests = allQuestsButCollector
		.reduce((acc, x) => acc.concat(x.require.quest), [])

	// Find all the leaf node quests (not required for anything except Collector)
	var finalQuests = allQuestsButCollector.filter(x => allRequiredQuests.indexOf(x.title) < 0)

	console.log(`There are ${finalQuests.length} leaf quests (no other quest except Collector requires them)`)

	// Find the maximum level value requirements for all of the collector required quests
	var highestCollectorLevel = Math.max(...allQuestsButCollector.filter(x => x.require.level).reduce((acc, x) => acc.concat(x.require.level), []))
	console.log(`The highest level quest required for Collector is ${highestCollectorLevel}`)

	console.log('Collector Required Quests:')
	console.log(finalQuests.reduce((acc, x) => acc.concat(x.title), []))
}

function newHideoutId(args) {
	var debugHideout = require('./hideout.json')

	var highestHideoutID = 0
	for (var i = debugHideout.length - 1; i >= 0; i--) {
		if (debugHideout[i].id > highestHideoutID) {
			highestHideoutID = debugHideout[i].id
		}
	}
	console.log(`Next quest ID: ${highestHideoutID + 1}`)
}

function newHideoutObjectiveId(args) {
	var debugHideout = require('./hideout.json')

	var objectiveArray = debugHideout
		.reduce((acc, x) => acc.concat(x.require), [])

	var highestObjectiveID = 0
	for (var i = objectiveArray.length - 1; i >= 0; i--) {
		if (objectiveArray[i].id > highestObjectiveID) {
			highestObjectiveID = objectiveArray[i].id
		}
	}
	console.log(`Next hideout objective ID: ${highestObjectiveID + 1}`)
}

function newQuestId(args) {
	var debugQuests = require('./quests.json')

	var highestQuestID = 0
	for (var i = debugQuests.length - 1; i >= 0; i--) {
		if (debugQuests[i].id > highestQuestID) {
			highestQuestID = debugQuests[i].id
		}
	}
	console.log(`Next quest ID: ${highestQuestID + 1}`)
}

function newObjectiveId(args) {
	var debugQuests = require('./quests.json')

	var objectiveArray = debugQuests
		.reduce((acc, x) => acc.concat(x.objectives), [])

	var highestObjectiveID = 0
	for (var i = objectiveArray.length - 1; i >= 0; i--) {
		if (objectiveArray[i].id > highestObjectiveID) {
			highestObjectiveID = objectiveArray[i].id
		}
	}
	console.log(`Next objective ID: ${highestObjectiveID + 1}`)
}

function verifyHideoutData(args) {
	// Find hideout IDs we may have duplicated (shouldn't happen)
	var debugHideout = require('./hideout.json')
	var result = Object.values(debugHideout.reduce((c, v) => {
		let k = v.id;
		c[k] = c[k] || [];
		c[k].push(v);
		return c;
	}, {})).reduce((c, v) => v.length > 1 ? c.concat(v) : c, []);
	if (result.length > 0) {
		console.log("Duplicate hideout IDs:")
		console.log(result)
	}

	// Find hideout indexes we haven't filled IDs for

	// Get highest ID
	var missingModuleIDs = []
	var highestHideoutID = 0
	for (var i = debugHideout.length - 1; i >= 0; i--) {
		if (debugHideout[i].id > highestHideoutID) {
			highestHideoutID = debugHideout[i].id
		}
	}
	var filledIDs = new Array(highestHideoutID).fill(false)
	for (var i = debugHideout.length - 1; i >= 0; i--) {
		filledIDs[debugHideout[i].id] = true
	}
	for (var i = filledIDs.length - 1; i >= 0; i--) {
		if (filledIDs[i] == false) {
			missingModuleIDs.push(i)
		}
	}
	if (missingModuleIDs.length > 0) {
		console.log("Missing Hideout IDs:")
		console.log(missingModuleIDs)
	}
	console.log(`Highest Hideout Module ID: ${highestHideoutID}`)

	// Find duplicated objective IDs (some may be intentional)
	var hideoutObjectives = []
	for (var i = debugHideout.length - 1; i >= 0; i--) {
		for (var x = debugHideout[i].require.length - 1; x >= 0; x--) {
			hideoutObjectives.push(debugHideout[i].require[x])
		}
	}
	var result = Object.values(hideoutObjectives.reduce((c, v) => {
		let k = v.id;
		c[k] = c[k] || [];
		c[k].push(v);
		return c;
	}, {})).reduce((c, v) => v.length > 1 ? c.concat(v) : c, []);
	if (result.length > 0) {
		console.log("Duplicate objective IDs:")
		console.log(result)
	}

	// Check for objective IDs we haven't filled or deleted:
	// Get highest ID
	var missingHideoutObjectiveIDs = []
	var highestObjectiveID = 0
	for (var i = hideoutObjectives.length - 1; i >= 0; i--) {
		if (hideoutObjectives[i].id > highestObjectiveID) {
			highestObjectiveID = hideoutObjectives[i].id
		}
	}
	var filledIDs = new Array(highestObjectiveID + 1).fill(false)
	for (var i = hideoutObjectives.length - 1; i >= 0; i--) {
		filledIDs[hideoutObjectives[i].id] = true
	}
	for (var i = filledIDs.length - 1; i >= 0; i--) {
		if (filledIDs[i] == false) {
			missingHideoutObjectiveIDs.push(i)
			console.log("ID " + i + " not filled")
		}
	}
	if (missingHideoutObjectiveIDs.length > 0) {
		console.log("Missing Objective IDs:")
		console.log(missingHideoutObjectiveIDs)
	}
	console.log("Highest Objective ID: " + highestObjectiveID)
}

function verifyQuestData(args) {

	var debugQuests = require('./quests.json')

	var questDictionaryTitle = debugQuests.reduce((a, x) => ({ ...a,
		[x.title]: x
	}), {})
	var questDictionaryId = debugQuests.reduce((a, x) => ({ ...a,
		[x.id]: x
	}), {})


	var result = Object.values(debugQuests.reduce((c, v) => {
		let k = v.id;
		c[k] = c[k] || [];
		c[k].push(v);
		return c;
	}, {})).reduce((c, v) => v.length > 1 ? c.concat(v) : c, []);
	if (result.length > 0) {
		console.log("Duplicate quest IDs:")
		console.log(result)
	}

	// Find quests we haven't filled IDs for

	// Get highest ID
	var highestQuestID = 0
	var missingQuestIds = []
	for (var i = debugQuests.length - 1; i >= 0; i--) {
		if (debugQuests[i].id > highestQuestID) {
			highestQuestID = debugQuests[i].id
		}
	}
	var filledIDs = new Array(highestQuestID).fill(false)
	for (var i = debugQuests.length - 1; i >= 0; i--) {
		filledIDs[debugQuests[i].id] = true
	}
	for (var i = filledIDs.length - 1; i >= 0; i--) {
		if (filledIDs[i] == false) {
			missingQuestIds.push(i)
		}
	}
	if (missingQuestIds.length > 0) {
		console.log("Missing Quest IDs:")
		console.log(missingQuestIds)
	}
	console.log("Highest Quest ID: " + highestQuestID)

	// Find quests we may have duplicated titles of
	var result = Object.values(debugQuests.reduce((c, v) => {
		let k = v.title;
		c[k] = c[k] || [];
		c[k].push(v);
		return c;
	}, {})).reduce((c, v) => v.length > 1 ? c.concat(v) : c, []);
	if (result.length > 0) {
		console.log("Duplicate quest titles:")
		console.log(result)
	}

	// Find duplicated objective IDs (some may be intentional)
	var questObjectives = []
	for (var i = debugQuests.length - 1; i >= 0; i--) {
		for (var x = debugQuests[i].objectives.length - 1; x >= 0; x--) {
			questObjectives.push(debugQuests[i].objectives[x])
		}
	}
	var result = Object.values(questObjectives.reduce((c, v) => {
		let k = v.id;
		c[k] = c[k] || [];
		c[k].push(v);
		return c;
	}, {})).reduce((c, v) => v.length > 1 ? c.concat(v) : c, []);
	if (result.length > 0) {
		console.log("Duplicate objective IDs (some may be intentional):")
		console.log(result)
	}

	// Check for objective IDs we haven't filled or deleted:
	// Get highest ID
	var missingObjectiveIds = []
	var highestObjectiveID = 0
	for (var i = questObjectives.length - 1; i >= 0; i--) {
		if (questObjectives[i].id > highestObjectiveID) {
			highestObjectiveID = questObjectives[i].id
		}
	}
	var filledIDs = new Array(highestObjectiveID + 1).fill(false)
	for (var i = questObjectives.length - 1; i >= 0; i--) {
		filledIDs[questObjectives[i].id] = true
	}
	for (var i = filledIDs.length - 1; i >= 0; i--) {
		if (filledIDs[i] == false) {
			missingObjectiveIds.push(i)
			console.log("ID " + i + " not filled")
		}
	}
	if (missingObjectiveIds.length > 0) {
		console.log("Missing Quest IDs:")
		console.log(missingObjectiveIds)
	}
	console.log("Highest Objective ID: " + highestObjectiveID)

	//Check for undefined required quests
	var badRequirement = []
	for (var i = debugQuests.length - 1; i >= 0; i--) {
		if (!('giver' in debugQuests[i])) {
			console.log("ID " + i + " doesn't have giver")
		}
		if ('require' in debugQuests[i] && 'quest' in debugQuests[i].require) {
			for (var x = debugQuests[i].require.quest.length - 1; x >= 0; x--) {
				if (questDictionaryTitle[debugQuests[i].require.quest[x]] == null) {
					badRequirement.push({
						quest: i,
						requirement: debugQuests[i].require.quest[x]
					})
					console.log("ID " + i + " has undefined requirement " + debugQuests[i].require.quest[x])
				}
			}
		} else {
			badRequirement.push({
				quest: i,
				requirement: null
			})
			console.log("ID " + i + " doesn't have quest require")
		}
	}
	if (badRequirement.length > 0) {
		console.log("Broken quest data:")
		console.log(badRequirement)
	}
}

vorpal.parse(process.argv);