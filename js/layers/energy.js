addLayer("e", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
      batteryTime: 30,
      batteryCooldown: 30,
      batterySize: 30,
      batteryOutput: 30,
      usingBattery: false
    }},

    color: "#bfae55",                       // The color for this layer, which affects many elements.
    resource: "energy",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).
  position: 0,

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1e12),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.1,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return hasUpgrade("c",33)||player.e.unlocked },          // Returns a bool for if this layer's node should be visible in the tree.

    branches: ["c"],
  
    clickables: {
      11: {
        display(){return `<h2>The Battery</h2><br>${player.e.usingBattery?(player.e.batteryTime==0?`Battery on cooldown.<br>${formatTime(player.e.batteryCooldown)}`:`Using battery! Multiplying point gain by ${format(tmp.e.batteryBoost)}<br>${formatTime(player.e.batteryTime)}`):`Activate the battery to multiply point gain by ${format(tmp.e.batteryBoost)}`}`},
        canClick(){return !player.e.usingBattery&&player.e.unlocked},
        onClick(){
          player.e.usingBattery=true
        }
      }
    },
  
  milestones: {
    0: {
      requirementDescription: "5 energy",
      effectDescription: "Keep upgrades that cost doublers on reset.",
      done() { return player.e.total.gte(5) }
    },
    1: {
      requirementDescription: "10 energy",
      effectDescription: "Keep upgrades that effects point gain on reset.",
      done() { return player.e.total.gte(10) }
    },
    2: {
      requirementDescription: "50 energy",
      effectDescription: "Keep upgrades that are kept on energy reset on PP reset.",
      done() { return player.e.total.gte(50) }
    },
    3: {
      requirementDescription: "100 energy",
      effectDescription: "Keep upgrades that has something to do with doublers on reset.",
      done() { return player.e.total.gte(100) }
    },
    4: {
      requirementDescription: "1,000 energy",
      effectDescription: "Keep the pointless upgrade on reset.",
      done() { return player.e.total.gte(1000) }
    },
  },
  
  update(diff){
    if(player.e.usingBattery){
      player.e.batteryTime=Math.max(player.e.batteryTime-diff,0)
      if(player.e.batteryTime==0)player.e.batteryCooldown=Math.max(player.e.batteryCooldown-diff,0)
      if(player.e.batteryCooldown==0){
        player.e.batteryCooldown=player.e.batterySize/(hasUpgrade("e",13)?2:1)
        player.e.batteryTime=player.e.batteryOutput
        player.e.usingBattery=false
      }
    }else{
      player.e.batteryCooldown=player.e.batterySize/(hasUpgrade("e",13)?2:1)
      player.e.batteryTime=player.e.batteryOutput
    }
  },
  
  batterySizeBoost(){
    let boost = new Decimal(player.e.batterySize).div(10).pow(2).add(1)
    
    return boost
  },
  
  batteryOutputBoost(){
    let boost = new Decimal(1).div(player.e.batteryOutput/30)
    
    return boost
  },
  
  batteryBoost(){
    return tmp.e.batterySizeBoost.times(tmp.e.batteryOutputBoost).pow(hasUpgrade("e",12)?2:1).max(1)
  },
  
  upgrades: {
    11: {
      title: "Counting Synergy",
      description: "The amount of times you've counted boosts point gain.",
      cost: new Decimal(2),
      effect(){
        let eff = player.c.totalCounts.add(1).log10().add(1)
        
        return eff
      },
      effectDisplay(){return `${format(upgradeEffect("e",11))}x`}
    },
    12: {
      title: "Better Battery",
      description: "Square the battery effect.",
      cost: new Decimal(3),
    },
    13: {
      title: "Powerful Battery",
      description: "Half the battery cooldown.",
      cost: new Decimal(3),
    },
  },
  
  tabFormat:{
    Main:{
      content:[
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "milestones",
        "blank",
        "upgrades"
      ]
    },
    "The Battery":{
      content:[
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["clickable",11],
        ["row",[["display-text","&nbsp;&nbsp;Battery Size: "],function(){return player.e.usingBattery?["display-text",formatWhole(player.e.batterySize)]:["slider",["batterySize",1,60]]}]],
        ["row",[["display-text","Battery Output: "],function(){return player.e.usingBattery?["display-text",formatWhole(player.e.batteryOutput)]:["slider",["batteryOutput",1,60]]}]]
      ],
      shouldNotify(){
        return !!Object.keys(layers.e.upgrades).filter(u=>u!="rows"&&u!="cols"&&!hasUpgrade("e",u)&&player.e.points.gte(tmp.e.upgrades[u].cost)).length
      }
    }
  }
})