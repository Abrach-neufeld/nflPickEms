
const fetch = require('isomorphic-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class game {
  constructor(homeTeam,awayTeam,homeWinProb,awayWinProb,tieProb) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.homeWinProb=homeWinProb;
    this.awayWinProb=awayWinProb;
    this.tieProb=tieProb;

  }
}

async function getWinProb(url,avisPick) {



    const response = await fetch(url);
    const text = await response.text();
    const dom = await new JSDOM(text);

    const stat = dom.window.document.querySelector('span.status-detail').textContent
    if (stat=="Final"){
      const homeTeam= dom.window.document.querySelector('span.away-team').textContent;
      const awayTeam= dom.window.document.querySelector('span.home-team').textContent;
      const scores= dom.window.document.querySelectorAll('div.score-container');
      const awayScore=parseInt(scores[0].textContent);
      const homeScore=parseInt(scores[1].textContent);


      var homeWinProb;
      var awayWinProb;
      var tieProb;

      if (homeScore>awayScore){ homeWinProb="100";  awayWinProb="0";  tieProb="0"; }
      else {if (homeScore<awayScore) { homeWinProb="0";  awayWinProb="100";  tieProb="0"}
        else {const homeWinProb="0";  awayWinProb="0";  tieProb="100"}
      }

      const gm = new game(homeTeam,awayTeam,homeWinProb,awayWinProb,tieProb)
      return gm

}

  else {
    if (stat==""){

      const tieProb= dom.window.document.querySelector('span.tie').textContent.replace("Tie: ", "").replace("%", "");
      const homeWinProb= dom.window.document.querySelector('span.value-home').textContent.replace("%", "");
      const awayWinProb= dom.window.document.querySelector('span.value-away').textContent.replace("%", "");
      const awayTeam= dom.window.document.querySelector('span.home-team').textContent;
      const homeTeam= dom.window.document.querySelector('span.away-team').textContent;
      const gm = new game(homeTeam,awayTeam,homeWinProb,awayWinProb,tieProb)
      return gm
    }
    else{
      const awayTeam= dom.window.document.querySelector('span.home-team').textContent;
      const homeTeam= dom.window.document.querySelector('span.away-team').textContent;
      const winProbText=dom.window.document.querySelectorAll('div.time-info')[0].textContent;

      const winTeam=winProbText.substring(0,3)
      const winProb=winProbText.replace(winTeam, "").replace("%", "").replace(" ", "")
      var homeWinProb;
      var awayWinProb;
      if (winTeam==homeTeam){homeWinProb=winProb; awayWinProb=(Math.round((100-winProb)*10)/10).toString()}
      else {awayWinProb=winProb; homeWinProb=(Math.round((100-winProb)*10)/10).toString()}

      const gm = new game(homeTeam,awayTeam,homeWinProb,awayWinProb,"0")
      return gm
  }
}


}








async function run_me(){
  var rows = [];
  var gm;
  const avisPicks = ["PHI","BUF","CLE","GB","DAL","DET","NO","TEN","TB","SF","KC","LAC","SEA","LAR"]
  const williePicks = ["PHI","BUF","CIN","GB","DAL","DET","NO","ATL","LV","NE","KC","JAX","SEA","LAR"]
  const joshsPicks = ["PHI","BUF","CLE","GB","DAL","ATL","NO","PIT","TB","NE","KC","LAC","SEA","LAR"]
  const alexPicks = ["NY","BUF","CLE","GB","DAL","ATL","NO","TEN","TB","SF","DEN","LAC","SEA","LAR"]
  const chuckPicks = ["PHI","BUF","CLE","GB","DAL","ATL","NO","PIT","TB","NE","KC","LAC","SEA","LAR"]
  const mikePicks = ["PHI","BUF","CLE","GB","DAL","DET","NO","TEN","TB","NE","KC","LAC","SEA","LAR"]
  const zachPicks = ["PHI","BUF","CIN","GB","WSH","ATL","NO","TEN","TB","NE","KC","LAC","SEA","LAR"]
  const jasperPicks = ["PHI","BUF","CLE","GB","WSH","ATL","NO","PIT","TB","NE","KC","LAC","ARI","LAR"]
  const jacobPicks = ["PHI","BUF","CLE","GB","WSH","ATL","NO","PIT","TB","NE","KC","LAC","SEA","LAR"]


  const picks = [avisPicks,williePicks,joshsPicks,alexPicks,chuckPicks,mikePicks,zachPicks,jasperPicks,jacobPicks]

  urlList=["https://www.espn.com/nfl/game/_/gameId/401220259",
    "https://www.espn.com/nfl/game/_/gameId/401220138",
  "https://www.espn.com/nfl/game/_/gameId/401220155",
  "https://www.espn.com/nfl/game/_/gameId/401220183",
  "https://www.espn.com/nfl/game/_/gameId/401220266",
  "https://www.espn.com/nfl/game/_/gameId/401220310",
  "https://www.espn.com/nfl/game/_/gameId/401220322",
  "https://www.espn.com/nfl/game/_/gameId/401249063",
  "https://www.espn.com/nfl/game/_/gameId/401220232",
  "https://www.espn.com/nfl/game/_/gameId/401220136",
  "https://www.espn.com/nfl/game/_/gameId/401220210",
  "https://www.espn.com/nfl/game/_/gameId/401220241",
  "https://www.espn.com/nfl/game/_/gameId/401220338",
  "https://www.espn.com/nfl/game/_/gameId/401220351"

]
  for (i in urlList){

    gm = await getWinProb(urlList[i])
    for (j=0;j<picks.length;j++){
    if (picks[j][i]=="H") {picks[j][i]=gm.homeTeam}
    else{if(picks[j][i]=="A"){picks[j][i]=gm.awayTeam}}


  }
rows.push(gm)

var homeTeams =[];
var awayTeams =[];
var homeWinProbs=[];
var awayWinProbs=[];
var projected=[0,0,0,0,0,0,0,0,0]
  }


    for(i = 0;i < rows.length; i++){
      homeTeams.push(rows[i].homeTeam);
      awayTeams.push(rows[i].awayTeam);
      homeWinProbs.push(rows[i].homeWinProb);
      awayWinProbs.push(rows[i].awayWinProb);
    }
    for (person=0;person<picks.length;person++){
      console.log(picks[person])
      for (game=0; game<picks[person].length;game++)
      {
        if(picks[person][game]==homeTeams[game]){projected[person]+=parseFloat(homeWinProbs[game])}
        else{projected[person]+=parseFloat(awayWinProbs[game])}
      }


    }
    //console.log(projected[0]/100)
console.log(rows)


}
async function test(){
  var obj = await getWinProb("https://www.espn.com/nfl/game/_/gameId/401220259")
console.log(obj)
}
test()
//run_me();
