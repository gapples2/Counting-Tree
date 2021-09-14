addLayer("u", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
      unlockedBuyables: 1
    }},
symbol: "PP",
    color: "#9abdfa",                       // The color for this layer, which affects many elements.
    resource: "power points",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).
  position: 1,

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1e22),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.4,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return player.points.gte(1e21)||player.u.unlocked },          // Returns a bool for if this layer's node should be visible in the tree.
  branches: ["c"],

  grid: {
    maxRows: 1,
    maxCols: 99,
    rows(){return 1}, // If these are dynamic make sure to have a max value as well!
    cols(){return player.u.unlockedBuyables},
    getStartData(id) {
      return new Decimal(0)
    },
    getUnlocked(id) { // Default
      return true
    },
    getCanBuy(data,id){
      if(!id||!data)return new Decimal(Infinity)
      if(id==101)return player.u.points.gte(this.getCost(data,id))
      return player.u.grid[id-1].gte(this.getCost(data,id))
    },
    getCanClick(data, id) {
      return this.getCanBuy(data,id)
    },
    onClick(data, id) { 
      let cost = this.getCost(data,id)
      if(id==101)player.u.points=player.u.points.minus(cost)
      else{
        player[this.layer].grid[id-1]=player[this.layer].grid[id-1].minus(cost)
        if(id>102)for(let x=2;x<id-100;x++)player[this.layer].grid[id-x]=new Decimal(0)
      }
      player[this.layer].grid[id]=player[this.layer].grid[id].add(1)
      if(player[this.layer].unlockedBuyables==id-100)player[this.layer].unlockedBuyables++
    },
    getCost(data,id){
      if(!data||!id)return;
      return new Decimal(id%100+1).pow(data.add(1)).minus(1)
    },
    getDisplay(data, id) {
      return `<b>Booster${id==101?"":"^"+id%100}</b><br>Cost: ${format(this.getCost(data, id))} ${id==101?"PP":(id==102?"Boosters":"Booster^"+(id%100-1)+"s")}<br>You have ${formatWhole(data)} booster${id==101?"s":"^"+id%100+"s"}<br>^${format(this.getEffect(data,id))}`
    },
    getEffect(data, id){
      return new Decimal(data).sqrt().div(25/(id%100)).add(1)
    },
    getStyle(){return {"width":"150px"}}
  },
  totalExp(){
    let e = new Decimal(1)
    for(let x=0;x<player.u.unlockedBuyables;x++)e=e.times(layers.u.grid.getEffect(getGridData("u",x+101),x+101))
    return e
  },
  tabFormat:[
    "main-display",
    "prestige-button",
    "resource-display",
    "blank",
    "grid"
  ]
})