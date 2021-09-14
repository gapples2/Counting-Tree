function createAchRow(achs){
  let a = ["row",[]]
  achs.forEach(ach=>a[1].push(["achievement",ach]))
  return a
}

function createAchRows(achs){
  let a = []
  achs.forEach(ach=>a.push(createAchRow(ach)))
  return a
}

addLayer("achs", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
    }},
    row: "side",                                 // The row this layer is on (0 is the first row).
    tooltip: "",
  color: "#ffff00",
  symbol: "A",
    type: "none",                         // Determines the formula used for calculating prestige currency.
    layerShown(){return true},          // Returns a bool for if this layer's node should be visible in the tree.
    achievements: {
      11: {
        name: "Doubled",
        tooltip: "Buy a doubler.",
        done(){return player.c.grid[101].gte(1)}
      },
      12: {
        name: "Tripled",
        tooltip: "Buy a tripler.",
        done(){return player.c.grid[102].gte(1)}
      },
      13: {
        name: "Quadrupled",
        tooltip: "Buy a quadrupler.",
        done(){return player.c.grid[103].gte(1)}
      },
      14: {
        name: "how?",
        tooltip: "Buy a certain upgrade.",
        done(){return hasUpgrade("c",22)}
      },
      15: {
        name: "New Layer!",
        tooltip: "Unlock Energy.",
        done(){return hasUpgrade("c",33)}
      },
      21: {
        name: "Kinda Long Grind",
        tooltip: "Get 2 energy.",
        done(){return player.e.points.gte(2)},
        unlocked(){return hasAchievement(this.layer,Math.floor(this.id/10-1)*10+5)}
      },
      22: {
        name: "2 in 1 Special",
        tooltip: "Be able to get 2 energy in 1 reset.",
        done(){return tmp.e.resetGain.gte(2)},
        unlocked(){return hasAchievement(this.layer,Math.floor(this.id/10-1)*10+5)}
      },
      23: {
        name: "Yet Another Tripler",
        tooltip: "Buy 5 triplers.",
        done(){return player.c.grid[102].gte(5)}
      },
      24: {
        name: "Boosted",
        tooltip: "Buy a booster.",
        done(){return player.u.grid[101].gte(1)}
      },
      25: {
        name: "Boosted^2",
        tooltip: "Buy a booster^2.",
        done(){return player.u.grid[102].gte(1)}
      },
      31: {
        name: "Boosted^3",
        tooltip: "Buy a booster^3.",
        done(){return player.u.grid[103].gte(1)}
      },
    },
  tabFormat:[
    ["display-text",function(){return "<h2 style='color:#ffff00;text-shadow:0 0 10px #ffff00'>"+tmp.achs.achAmt+"/"+(Object.keys(layers.achs.achievements).length-2)+"</h2> achievements completed"}],
    "achievements"
  ],
  achAmt(){return player.achs.achievements.length}
})