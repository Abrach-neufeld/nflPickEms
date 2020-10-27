
const fetch = require('isomorphic-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class game {
  constructor(homeTeam,awayTeam,homeWinProb,awayWinProb) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.homeWinProb=homeWinProb;
    this.awayWinProb=awayWinProb;


  }
}

async function getWinProb(url,avisPick) {



    const response = await fetch(url);
    const text = await response.text();
    const dom = await new JSDOM(text);

    const stat = dom.window.document.querySelector('span.status-detail').textContent
    console.log(stat)
    if (stat=="Final"){
      const homeTeam= dom.window.document.querySelector('span.away-team').textContent;
      const awayTeam= dom.window.document.querySelector('span.home-team').textContent;
      const scores= dom.window.document.querySelectorAll('div.score-container');
      const awayScore=parseInt(scores[0].textContent);
      const homeScore=parseInt(scores[1].textContent);


      var homeWinProb;
      var awayWinProb;

      if (homeScore>awayScore){ homeWinProb=100;  awayWinProb=0}
      else {if (homeScore<awayScore) { homeWinProb=0;  awayWinProb=100}
        else { homeWinProb=0;  awayWinProb=0;}
      }
      const gm = new game(homeTeam,awayTeam,homeWinProb,awayWinProb)
      return gm

}

  else {
    if (stat==""){

      const homeWinProb= parseFloat(dom.window.document.querySelector('span.value-home').textContent.replace("%", ""));
      const awayWinProb= parseFloat(dom.window.document.querySelector('span.value-away').textContent.replace("%", ""));
      const awayTeam= dom.window.document.querySelector('span.home-team').textContent;
      const homeTeam= dom.window.document.querySelector('span.away-team').textContent;
      const gm = new game(homeTeam,awayTeam,homeWinProb,awayWinProb)
      return gm
    }
    else{
      const awayTeam= dom.window.document.querySelector('span.home-team').textContent;
      const homeTeam= dom.window.document.querySelector('span.away-team').textContent;
      const winProbText=dom.window.document.querySelectorAll('div.time-info')[0].textContent;

      const winTeam=winProbText.substring(0,3)
      const winProb=parseFloat(winProbText.replace(winTeam, "").replace("%", "").replace(" ", ""))
      var homeWinProb;
      var awayWinProb;
      if (winTeam==homeTeam){homeWinProb=winProb; awayWinProb=(Math.round((100-winProb)*10)/10)}
      else {awayWinProb=winProb; homeWinProb=(Math.round((100-winProb)*10)/10)}

      const gm = new game(homeTeam,awayTeam,homeWinProb,awayWinProb,0)
      return gm
  }
}


}








async function run_me(){
  var rows = [];
  var gm;
  const avisPicks = ["A","A","H","H","H","H","A","H","H","A","H","H","H","H"]
  const williePicks = ["H","H","H","H","H","H","H","H","H","H","H","H","H","H"]
  const joshsPicks =["H","H","H","H","H","H","H","H","H","H","H","H","H","H"]
  const alexPicks = ["H","H","H","H","H","H","H","H","H","H","H","H","H","H"]
  const chuckPicks = ["H","H","H","H","H","H","H","H","H","H","H","H","H","H"]
  const mikePicks = ["H","H","H","H","H","H","H","H","H","H","H","H","H","H"]
  const zachPicks = ["H","H","H","H","H","H","H","H","H","H","H","H","H","H"]
  const jasperPicks = ["H","H","H","H","H","H","H","H","H","H","H","H","H","H"]
  const jacobPicks = ["H","H","H","H","H","H","H","H","H","H","H","H","H","H"]


  const picks = [avisPicks,williePicks,joshsPicks,alexPicks,chuckPicks,mikePicks,zachPicks,jasperPicks,jacobPicks]

  urlList=["https://www.espn.com/nfl/game/_/gameId/401220314",
  "https://www.espn.com/nfl/game/_/gameId/401220115",
  "https://www.espn.com/nfl/game/_/gameId/401220158",
  "https://www.espn.com/nfl/game/_/gameId/401220169",
  "https://www.espn.com/nfl/game/_/gameId/401220288",
  "https://www.espn.com/nfl/game/_/gameId/401220292",
  "https://www.espn.com/nfl/game/_/gameId/401220222",
  "https://www.espn.com/nfl/game/_/gameId/401220127",
  "https://www.espn.com/nfl/game/_/gameId/401220148",
  "https://www.espn.com/nfl/game/_/gameId/401220212",
  "https://www.espn.com/nfl/game/_/gameId/401220277",
  "https://www.espn.com/nfl/game/_/gameId/401220361",
  "https://www.espn.com/nfl/game/_/gameId/401220258",
  "https://www.espn.com/nfl/game/_/gameId/401220257"
]
  for (i in urlList){

    gm = await getWinProb(urlList[i])
    for (j=0;j<picks.length;j++){
    if (picks[j][i]=="H") {picks[j][i]=gm.homeTeam}
    else{if(picks[j][i]=="A"){picks[j][i]=gm.awayTeam}}


  }
rows.push(gm)
var k = '<tbody>'
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

        k+= '<tr>';
        k+= '<td>' + rows[i].homeTeam + '</td>';
        k+= '<td>' + rows[i].awayTeam + '</td>';
        k+= '<td>' + rows[i].homeWinProb + '</td>';
        k+= '<td>' + rows[i].awayWinProb + '</td>';

        //k+= '<td>' + picks[j][i] + '</td>';
        for (j=0;j<picks.length;j++){
        if (((picks[j][i]==rows[i].homeTeam) && (rows[i].homeWinProb==100))||((picks[j][i]==rows[i].awayTeam) && (rows[i].awayWinProb==100)))
        {
          k+= '<td style="background-color:green">' + picks[j][i] + '</td>';
        }

        else
        {
          if(((picks[j][i]==rows[i].awayTeam) && (rows[i].homeWinProb==100))||((picks[j][i]==rows[i].homeTeam) && (rows[i].awayWinProb==100)))
          {
            k+= '<td style="background-color:red">' + picks[j][i] + '</td>';

          }
          else {
            k+= '<td>' + picks[j][i] + '</td>';
          }
        }
      }
  /*      k+= '</tr>';
    }
    k+= '<tr>';
    k+= '<td>' + "TOTAL" + '</td>';
    k+= '<td>' + "PROJECTED" + '</td>';
    k+= '<td>' + "WINS" + '</td>';
    k+= '<td>' + "" + '</td>';
    k+= '<td>' + "" + '</td>';
    for (person=0;person<picks.length;person++){
      for (game=0; game<picks[person].length;game++)
      {

        if(picks[person][game]==homeTeams[game]){projected[person]+=homeWinProbs[game]}
        else{projected[person]+=awayWinProbs[game]}
      }
      k+= '<td>' + Math.round(projected[person]/10)/10+ '</td>';
    }
    k+= '</tr>';
    k+='</tbody>';*/

    k+= '</tr>';
     }
     k+= '<tr>';
     k+= '<td>' + "WIN" + '</td>';
     k+= '<td>' + "PERCENTAGE" + '</td>';
     k+= '<td>' + "" + '</td>';
     k+= '<td>' + "" + '</td>';
     var rand;
     var winTeam;
     var simWins = [0,0,0,0,0,0,0,0,0]
     const numSims = 5000;
     var winner;
     for (sim=0;sim<numSims;sim++){
       //Fill out gameWins
       var gameWins = [0,0,0,0,0,0,0,0,0]
       for (game=0;game<homeTeams.length;game++){

         rand = Math.random()*100;
         if (rand<homeWinProbs[game]){winTeam=homeTeams[game]}
         else {winTeam=awayTeams[game]}
         for (person=0; person<picks.length;person++)
         {
           if(picks[person][game]==winTeam){gameWins[person]+=1}
         }
       }
       //Fill out simWins
       const max = Math.max(...gameWins)
       var winArray=[]
       for (i=0;i<gameWins.length;i++)
       {
         if (gameWins[i]==max) {winArray.push(i)}
       }
       for (i=0;i<winArray.length;i++)
       {
         simWins[winArray[i]]+=1/winArray.length
       }
   }
  for (person=0; person<picks.length;person++)
  {
    k+= '<td>' + Math.round(simWins[person]*100/numSims)+ '</td>';
    //k+= '<td>' + gameWins[person]+ '</td>';
  }
  k+= '</tr>';
  k+='</tbody>';
  document.getElementById('tableData').innerHTML = k;
  return rows

}
rows = run_me();
