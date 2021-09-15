let modInfo = {
	name: "a counting tree",
	id: "cdhicdihadhiadnhiasduh",
	author: "gapples2",
	pointsName: "points",
	modFiles: ["layers/counting.js", "tree.js", "layers/achs.js", 'layers/energy.js', 'layers/upgrades.js'],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0.5,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.002",
	name: "Inflation Era",
}

let changelog = `<h1>Changelog:</h1><br>
  <h3>v0.002 ~ Inflation Era</h3><br>
    - Added AutoTokens<br>
    - Created 3 new achievements<br>
    Endgame: All achievements<br>
  <br>
  <h3>v0.001 ~ Autocount</h3><br>
    - Added autocount (which should be obvious)<br>
    Endgame: same as v0.000<br>
  <br>
	<h3>v0.000 ~ The Beginnings</h3><br>
		- Created counting, energy, and PP.<br>
		- Endgame: All achievements
  `

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
  gain=gain.times(tmp.c.totalMult)
  if(hasUpgrade("c",11))gain=gain.times(2)
  if(hasUpgrade("c",13))gain=gain.times(upgradeEffect("c",13))
  if(hasUpgrade("c",31))gain=gain.times(upgradeEffect("c",31))
  if(player.e.usingBattery&&player.e.batteryTime>0)gain=gain.times(tmp.e.batteryBoost)
  if(hasUpgrade("e",11))gain=gain.times(upgradeEffect("e",11))
  
  gain=gain.pow(tmp.u.totalExp)
	return gain.round()
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
  function(){
    if(player.e.usingBattery&&(player.tab!="e"||player.tab=="e"&&player.subtabs.e.mainTabs!="The Battery")){
      if(player.e.batteryTime==0)return `Battery Cooldown: ${formatTime(player.e.batteryCooldown)}`
      return `Battery Time: ${formatTime(player.e.batteryTime)}`
    }
  }
]

// Determines when the game "ends"
function isEndgame() {
	return tmp.achs.achAmt==Object.keys(layers.achs.achievements).length-2
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

var firstLoad = true