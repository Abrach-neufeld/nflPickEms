
const fetch = require('isomorphic-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
//CLASSES
class game {
  constructor(homeTeam,awayTeam,homeWinProb,awayWinProb) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.homeWinProb=homeWinProb;
    this.awayWinProb=awayWinProb;
  }
}
//FUNCTIONS
async function getWinProb(url)
{
  //Takes an espn gamecast url and returns a game object with home/away team/winProb
  //Get data from espn
    const response = await fetch(url);
    const text = await response.text();
    const dom = await new JSDOM(text);
// Find if game is yet to start, in progress or over
    const stat = dom.window.document.querySelector('span.status-detail').textContent
    //get home and away teams
    const homeTeam= dom.window.document.querySelector('span.away-team').textContent;
    const awayTeam= dom.window.document.querySelector('span.home-team').textContent;
    //If the game is over
    if (stat=="Final")
    {
      //Get Scores
      const scores= dom.window.document.querySelectorAll('div.score-container');
      const awayScore=parseInt(scores[0].textContent);
      const homeScore=parseInt(scores[1].textContent);
      //Turn scores into win%
      var homeWinProb;
      var awayWinProb;
      if (homeScore>awayScore){ homeWinProb=100;  awayWinProb=0}
      else
      {
        if (homeScore<awayScore) { homeWinProb=0;  awayWinProb=100}
        else { homeWinProb=0;  awayWinProb=0;}
      }

      const gm = new game(homeTeam,awayTeam,homeWinProb,awayWinProb)
      return gm

    }

  else
  {
    //If game is yet to start
    if (stat=="")
    {
        //get win prob
        const homeWinProb= parseFloat(dom.window.document.querySelector('span.value-home').textContent.replace("%", ""));
        const awayWinProb= parseFloat(dom.window.document.querySelector('span.value-away').textContent.replace("%", ""));

        const gm = new game(homeTeam,awayTeam,homeWinProb,awayWinProb)
        return gm
    }
    else
    {
        //if game is in progress
        //Get win probability for winning team and name of winning team
        const winProbText=dom.window.document.querySelectorAll('div.time-info')[0].textContent;
        const winTeam=winProbText.substring(0,3)
        //Calculate win probability of losing teams
        //NOTE: DOES NOT HANDLE TIES WELL
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



async function createTable(urlList,picks)
{
  var rows = [];
  var gm;
  //Loop over each game url
  for (i in urlList)
  {
    //get game object and add to rows
    gm = await getWinProb(urlList[i])
    rows.push(gm)
    //Convert from H/A to team name
    for (j=0;j<picks.length;j++)
    {
      if (picks[j][i]=="H") {picks[j][i]=gm.homeTeam}
      else
      {
        if(picks[j][i]=="A"){picks[j][i]=gm.awayTeam}
      }
    }
    //Initialize empty lists/arrays
    var homeTeams =[];
    var awayTeams =[];
    var homeWinProbs=[];
    var awayWinProbs=[];
    var projected=new Array(picks.length).fill(0);



  }
  var k = '<tbody>'

    //Loop over each game
    for(i = 0;i < rows.length; i++)
    {
      //Add data to lists
      homeTeams.push(rows[i].homeTeam);
      awayTeams.push(rows[i].awayTeam);
      homeWinProbs.push(rows[i].homeWinProb);
      awayWinProbs.push(rows[i].awayWinProb);
      //Add table row
      k+= '<tr>';
      //Add table columns
      k+= '<td>' + rows[i].homeTeam + '</td>';
      k+= '<td>' + rows[i].awayTeam + '</td>';
      k+= '<td>' + rows[i].homeWinProb + '</td>';
      k+= '<td>' + rows[i].awayWinProb + '</td>';
      //Loop over each persons picks and make cell green if right, red if wrong
      for (j=0;j<picks.length;j++)
      {
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
          else
          {
            k+= '<td>' + picks[j][i] + '</td>';
          }
        }
      }
      k+= '</tr>';
     }
     //Add in win% row
     k+= '<tr>';
     k+= '<td>' + "<b> WIN% </b>" + '</td>';
     k+= '<td>' + "" + '</td>';
     k+= '<td>' + "" + '</td>';
     k+= '<td>' + "" + '</td>';
     var rand;
     var winTeam;
     var simWins =new Array(picks.length).fill(0);
     var gameWins;
     const numSims = 5000;
     var winner;
     //simulate numSims time
     for (sim=0;sim<numSims;sim++)
     {
       //reset out gameWins
       gameWins =new Array(picks.length).fill(0);
       //loop over each game
       for (game=0;game<homeTeams.length;game++)
       {
         //determine the winning team
         rand = Math.random()*100;
         if (rand<homeWinProbs[game]){winTeam=homeTeams[game]}
         else {winTeam=awayTeams[game]}
         //Loop over each person and give them a game win if their pick matched simulated winning eam
         for (person=0; person<picks.length;person++)
         {
           if(picks[person][game]==winTeam){gameWins[person]+=1}
         }
       }
       //Fill out simWins
       const max = Math.max(...gameWins)
       var winArray=[]
       //determine who won the simulated win
       for (i=0;i<gameWins.length;i++)
       {
         if (gameWins[i]==max) {winArray.push(i)}
       }
       //If multiple people got the same number of games correct. Split the win between them
       for (i=0;i<winArray.length;i++)
       {
         simWins[winArray[i]]+=1/winArray.length
       }
   }
   //Add in each persons win percentage
  for (person=0; person<picks.length;person++)
  {
    k+= '<td>' + Math.round(simWins[person]*100/numSims)+ '</td>';
    //k+= '<td>' + gameWins[person]+ '</td>';
  }
  k+= '</tr>';
  k+='</tbody>';
  document.getElementById('tableData').innerHTML = k;


}
createTable(urlList,picks);
