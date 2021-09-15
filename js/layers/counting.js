addLayer("c", {
    name: "c", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
      count: "",
      inTab: false,
      totalCounts: new Decimal(0),
      unlockedBuyables: 1,
      autochar: 0,
      autotokens:{
        total: new Decimal(0),
        amt: new Decimal(0),
        speed: new Decimal(0),
        bulk: new Decimal(0)
      }
    }},
    color: "#f4ba7d",
    requires: new Decimal(1e309), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "Enter", description: "Press enter to submit count.", onPress(){layers.c.clickables[11].onClick()}},
    ],
    layerShown(){return true},
  tabFormat:{
    "Main":{
      content:[
        ["display-text","<h2>Counting</h2>"],
        ["row",[["text-input",["count"]],["clickable",11]]],
        ["display-text",function(){return "HINT: next number = "+format(player.points.add(getPointGen())).replaceAll(",","")}],
        ["display-text",function(){return `Autocount Interval: ${formatTime(player.c.autochar)}/${formatTime(tmp.c.autoCountTime)}`}],
        "blank",
        ["display-text","<h2>Buyables</h2>"],
        "grid",
      ],
    },
    "Upgrades":{
      content:[
        ["display-text","<h2>Upgrades</h2>"],
        "upgrades"
      ],
      shouldNotify(){return Object.keys(layers.c.upgrades).filter(u=>u!="rows"&&u!="cols"&&!hasUpgrade("c",u)&&player.points.gte(tmp.c.upgrades[u].cost)).length}
    },
    "AutoTokens":{
      content:[
        ["display-text","<h2>AutoTokens</h2>"],
        ["bar","autoTokens"],
        ["display-text",function(){return `You have ${formatWhole(player.c.autotokens.amt)}/${formatWhole(player.c.autotokens.total)} AutoTokens`}],
        ["row",[["clickable",21],["clickable",22]]],
        ["clickable",23]
      ]
    }
  },
  clickables: {
    11: {
      display: "Count",
      canClick: true,
      onClick(){
        if(format(player.points.add(getPointGen()))==format(player.c.count)){
          player.points=player.points.add(getPointGen())
          player.c.totalCounts = player.c.totalCounts.add(1)
        }
        player.c.count = ""
      },
      style: {"width":"50px","min-height":"20px"}
    },
    21: {
      display(){return `<b>AutoSpeed</b><br>Makes the Autocounter faster.<br>Cost: ${tmp.c.clickables[21].cost} AutoTokens<br>You have bought AutoSpeed ${formatWhole(player.c.autotokens.speed)} times`},
      cost(){return player.c.autotokens.speed.div(7).floor().add(1)},
      canClick(){return player.c.autotokens.amt.gte(tmp.c.clickables[21].cost)},
      onClick(){
        if(player.c.autotokens.amt.lt(tmp.c.clickables[21].cost))return;
        player.c.autotokens.amt=player.c.autotokens.amt.minus(tmp.c.clickables[21].cost)
        player.c.autotokens.speed=player.c.autotokens.speed.add(1)
      },
      style: {width:"200px","min-height":"80px"}
    },
    22: {
      display(){return `<b>AutoBulk</b><br>Makes the Autocounter 1.5x slower but counts 1 extra time.<br>Cost: ${tmp.c.clickables[22].cost} AutoTokens<br>You have bought AutoBulk ${formatWhole(player.c.autotokens.bulk)} times`},
      cost(){return player.c.autotokens.bulk.div(2).floor().add(1)},
      canClick(){return player.c.autotokens.amt.gte(tmp.c.clickables[22].cost)},
      onClick(){
        if(player.c.autotokens.amt.lt(tmp.c.clickables[22].cost))return;
        player.c.autotokens.amt=player.c.autotokens.amt.minus(tmp.c.clickables[22].cost)
        player.c.autotokens.bulk=player.c.autotokens.bulk.add(1)
      },
      style: {width:"200px","min-height":"80px"}
    },
    23: {
      display: "Respec AutoToken upgrades",
      canClick(){return player.c.autotokens.speed.gte(1)||player.c.autotokens.bulk.gte(1)},
      onClick(){
        player.c.autotokens.amt=player.c.autotokens.total
        player.c.autotokens.speed = new Decimal(0)
        player.c.autotokens.bulk = new Decimal(0)
      },
    },
  },
  bars: {
    autoTokens: {
      direction: RIGHT,
      width: 200,
      height: 25,
      progress() { return player.points.div(new Decimal(1000).pow(player.c.autotokens.total.add(1))).toNumber() },
      fillStyle: {"background-color":"#f4ba7d"},
      baseStyle: {"background-color":"#666666"},
      borderStyle: {"border-color":"#666666"},
      textStyle: {"color":"#000000"},
      display(){return (100-tmp.c.bars.autoTokens.progress).toFixed(2)+"%"}
    },
  },
  update(diff){
    if((!player.c.inTab||firstLoad)&&player.tab=="c"&&player.subtabs.c.mainTabs=="Main"){
      let input = document.getElementById("input-c-count")
      input.addEventListener("keyup", function(event) {
          event.preventDefault();
          if (event.keyCode === 13) {
              layers.c.clickables[11].onClick()
          }
      });
      input.autocomplete = 'off'
      input.type = 'text'
      player.c.inTab=true
      firstLoad = false
    }
    if(player.tab!="c"||player.subtabs.c.mainTabs!="Main")player.c.inTab = false
    
    player.c.autochar+=diff
    let act = tmp.c.autoCountTime
    if(player.c.autochar>=act){
      let times = Math.floor(player.c.autochar/act)
      player.c.autochar=tmp.c.autoCountTime%act
      player.points=player.points.add(getPointGen().times(times).times(player.c.autotokens.bulk.add(1)))
      player.c.totalCounts = player.c.totalCounts.add(new Decimal(times).times(player.c.autotokens.bulk.add(1)))
    }
    
    let at = player.points.log(1000)
    if(!isNaN(at)){
      at=at.floor().minus(player.c.autotokens.total).max(0)
      player.c.autotokens.total=player.c.autotokens.total.add(at)
      player.c.autotokens.amt=player.c.autotokens.amt.add(at)
    }
  },
  tooltip(){return `You have counted ${formatWhole(player.c.totalCounts)} times.`},
  grid: {
    rows: 1, // If these are dynamic make sure to have a max value as well!
    cols(){
      return player.c.unlockedBuyables
    },
    maxCols: 99,
    getStartData(id) {
        return new Decimal(0)
    },
    getUnlocked(id) { // Default
        return true
    },
    cost(data,id){
      if(!data||!id)return;
      if(id==101)return new Decimal(hasUpgrade("c",23)?4.5:5).pow(data).times(10).div(this.getDivide(id)).round()
      return new Decimal(id-100).pow(data.add(1)).div(this.getDivide(id)).round()
    },
    canBuy(data, id){
      if(!data||!id)return false
      if(id==101)return player.points.gte(this.cost(data,id))
      return getGridData("c",id-1).gte(this.cost(data,id))
    },
    getCanClick(data, id) {
        return this.canBuy(data,id)
    },
    onClick(data, id) {
      let cost = this.cost(data,id)
      if(id==101)player.points=player.points.minus(cost)
      else{
        player.points = new Decimal(0)
        player[this.layer].grid[id-1]=player[this.layer].grid[id-1].minus(cost)
        if(id>102)for(let x=2;x<id-100;x++)player[this.layer].grid[id-x]=new Decimal(0)
      }
      player[this.layer].grid[id]=player[this.layer].grid[id].add(1).round()
      if(player[this.layer].unlockedBuyables==id-100)player[this.layer].unlockedBuyables++
    },
    getDisplay(data, id) {
        return `<b>${this.getName(id)}</b><br>Cost: ${format(this.cost(data,id))} ${this.getName(id-1)}s<br>You have ${format(data)} ${this.getName(id).toLowerCase()}s.<br>${format(this.getEffect(data,id))}x`
    },
    getName(id){
      return ["point","Doubler","Tripler","Quadrupler","Quintipler","Sextupler"][id-100]||"x"+(id-99)
    },
    getEffect(data,id){
      return new Decimal(id-99).pow(data)
    },
    getStyle(){return {"width":"150px"}},
    getDivide(id){
      let div = new Decimal(1)
      switch(id){
        case 101:
          if(hasUpgrade("c",12))div=div.mul(5)
          if(hasUpgrade("c",21))div=div.mul(tmp.achs.achAmt**2)
          return div
          break;
        default:
          return div
      }
    }
  },
  upgrades: {
    11: {
      title: "Free Doubler",
      description: "Double point gain.",
      cost: new Decimal(500),
      currencyDisplayName: "points",
      currencyInternalName: "points"
    },
    12: {
      title: "Cheap Doublers",
      description: "Doublers are 5x cheaper.",
      cost: new Decimal(5000),
      currencyDisplayName: "points",
      currencyInternalName: "points"
    },
    13: {
      title: "Help from Achievements",
      description: "Multiply point gain by achievements earned.",
      cost: new Decimal(22222),
      currencyDisplayName: "points",
      currencyInternalName: "points",
      effect(){
        let eff = tmp.achs.achAmt
        if(hasUpgrade("c",32))eff=eff**2
        
        return eff
      },
      effectDisplay(){return `${format(tmp[this.layer].upgrades[this.id].effect)}x`}
    },
    21: {
      title: "Cheaper Doublers",
      description: "Doublers are cheaper based on achievements earned.",
      cost: new Decimal(10),
      currencyDisplayName: "doublers",
      currencyInternalName: 101,
      currencyLayer: "c",
      currencyLocation(){return player.c.grid},
      effect(){
        let eff = tmp.achs.achAmt**2
        
        return eff
      },
      effectDisplay(){return `/${format(tmp[this.layer].upgrades[this.id].effect)}`}
    },
    22: {
      title: "Kinda Pointless",
      description: "Finish an achievement.",
      cost: new Decimal(5e7),
      currencyDisplayName: "points",
      currencyInternalName: "points"
    },
    23: {
      title: "Not as Pointless",
      description: "Doubler cost scaling 5 -> 4.5.",
      cost: new Decimal(1e8),
      currencyDisplayName: "points",
      currencyInternalName: "points"
    },
    31: {
      title: "Second Boost",
      description: "Gain more points based on doublers.",
      cost: new Decimal(15),
      currencyDisplayName: "doublers",
      currencyInternalName: 101,
      currencyLayer: "c",
      currencyLocation(){return player.c.grid},
      effect(){
        let eff = player.c.grid[101].sqrt().add(1)
        
        return eff
      },
      effectDisplay(){return `${format(tmp[this.layer].upgrades[this.id].effect)}x`}
    },
    32: {
      title: "Better Achievements",
      description: "Square 'Help from Achievements'.",
      cost: new Decimal(5e10),
      currencyDisplayName: "points",
      currencyInternalName: "points"
    },
    33: {
      title: "New Layer?",
      description: "Unlock a new layer.",
      cost: new Decimal(20),
      currencyDisplayName: "doublers",
      currencyInternalName: 101,
      currencyLayer: "c",
      currencyLocation(){return player.c.grid},
    },
  },
  autoCountTime(){
    let t = 10/player.c.autotokens.speed.add(1).toNumber()
    t*=new Decimal(1.5).pow(player.c.autotokens.bulk).toNumber()
    if(tmp.c.mobileAndTabletCheck)t=Math.min(t,1)
    
    return t
  },
  totalMult(){
    let m = new Decimal(1)
    for(let x=0;x<player.c.unlockedBuyables;x++)m=m.times(layers.c.grid.getEffect(getGridData("c",x+101),x+101))
    return m
  },
  mobileAndTabletCheck: function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  },
  doReset(layer){
    if(layers[layer].row=="side"||layers[layer].row<layers[this.layer].row)return;
    let au = player.c.autotokens
    let keep = ["totalCounts","unlockedBuyables","count"]
    let keepupgs = [33]
    if(hasMilestone("e",0)&&(layer=="e"||layer=="u"&&hasMilestone("e",2)))keepupgs.push(21,31)
    if(hasMilestone("e",1)&&(layer=="e"||layer=="u"&&hasMilestone("e",2)))keepupgs.push(11,13,32)
    if(hasMilestone("e",3)&&(layer=="e"||layer=="u"&&hasMilestone("e",2)))keepupgs.push(12,23)
    if(hasMilestone("e",4)&&(layer=="e"||layer=="u"&&hasMilestone("e",2)))keepupgs.push(22)
    keepupgs=keepupgs.filter(upg=>hasUpgrade(this.layer,upg))
    layerDataReset("c",keep)
    keepupgs.forEach(upg=>{if(!hasUpgrade(this.layer,upg))player.c.upgrades.push(upg)})
    player.c.autotokens=au
  }
})