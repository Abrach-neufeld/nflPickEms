import React from 'react'
import axios from 'axios'
import * as NFLData from './data'
import {Table} from 'react-bootstrap'
import './Standings.css'

export default class Standings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: null
    }
  }

  componentDidMount() {
    this.generateTableData()
  }

  generateTableData = async () => {
    const table = await getTable(NFLData.gameIDs, NFLData.picks, NFLData.weights)
    this.setState({
      tableData: table
    })
  }

  render() {
    return (
      <Table hover bordered responsive size={'sm'} className='table'>
        <thead>
        <tr>
          <th>Home Team</th>
          <th>Away Team</th>
          <th>Home Win %</th>
          <th>Away Team %</th>

          <th>Avi</th>
          <th>Willie</th>
          <th>Josh</th>
          <th>Alex</th>
          <th>Chuck</th>
          <th>Mike</th>
          <th>Zach</th>
          <th>Jasper</th>
          <th>Jacob</th>
          <th>Gauresh</th>
        </tr>
        </thead>
        <tbody>
          {this.state.tableData}
        </tbody>
      </Table>
    )
  }
}


//CLASSES
class Game {
  constructor(homeTeam, awayTeam, homeWinProb, awayWinProb) {
    this.homeTeam = homeTeam
    this.awayTeam = awayTeam
    this.homeWinProb = homeWinProb
    this.awayWinProb = awayWinProb
  }
}

async function getWinProb(gameID) {
  //Takes an espn game id and returns a game object with home/away team/winProb

  //Get data from espn
  const response = await axios.get(NFLData.BASE_URL + gameID)
  const data = response.data

  //get home and away teams
  const homeTeam = data.boxscore.teams[1].team.abbreviation
  const awayTeam = data.boxscore.teams[0].team.abbreviation

  if (!data.winprobability) {
    //If game is yet to start
    const homeWinProb = parseFloat(data.predictor.homeTeam.gameProjection)
    const awayWinProb = parseFloat(data.predictor.awayTeam.gameProjection)

    return new Game(homeTeam, awayTeam, homeWinProb, awayWinProb)
  } else {
    //If game is in progress or over
    const winPercentages = data.winprobability[data.winprobability.length - 1]
    let homeWinProb = parseFloat(winPercentages.homeWinPercentage) * 100
    let awayWinProb = parseFloat(1 - winPercentages.homeWinPercentage) * 100

    // Round to 2 decimal places
    homeWinProb = Math.round((homeWinProb + Number.EPSILON) * 100) / 100
    awayWinProb = Math.round((awayWinProb + Number.EPSILON) * 100) / 100

    return new Game(homeTeam, awayTeam, homeWinProb, awayWinProb, 0)
  }
}


async function getTable(urlList, picks, weights) {
  //Initialize empty lists/arrays
  const scores = new Array(picks.length).fill(0)
  const homeWinProbs = []
  const awayTeams = []
  const homeTeams = []
  const rows = []
  let gm
  //Loop over each game url
  for (let i = 0; i < urlList.length; i++) {
    //get game object and add to rows
    gm = await getWinProb(urlList[i])
    rows.push(gm)
    //Convert from H/A to team name
    for (let j = 0; j < picks.length; j++) {
      if (picks[j][i] === 'H') {
        picks[j][i] = gm.homeTeam
      } else {
        if (picks[j][i] === 'A') {
          picks[j][i] = gm.awayTeam
        }
      }
    }
  }

  const tableRows = []

  //Loop over each game
  for (let i = 0; i < rows.length; i++) {
    const tableColumns = []
    //Add data to lists
    homeTeams.push(rows[i].homeTeam)
    awayTeams.push(rows[i].awayTeam)
    homeWinProbs.push(rows[i].homeWinProb)

    //Add table columns
    tableColumns.push([
      <td>{rows[i].homeTeam}</td>,
      <td>{rows[i].awayTeam}</td>,
      <td>{rows[i].homeWinProb}</td>,
      <td>{rows[i].awayWinProb}</td>
    ])

    //Loop over each persons picks and make cell green if right, red if wrong
    for (let j = 0; j < picks.length; j++) {
      if (((picks[j][i] === rows[i].homeTeam) && (rows[i].homeWinProb === 100)) || ((picks[j][i] === rows[i].awayTeam) && (rows[i].awayWinProb === 100))) {
        tableColumns.push(<td className='bg-success'>{picks[j][i] + ' (' + weights[j][i] + ')'}</td>)
        scores[j] += weights[j][i]
      } else if (((picks[j][i] === rows[i].awayTeam) && (rows[i].homeWinProb === 100)) || ((picks[j][i] === rows[i].homeTeam) && (rows[i].awayWinProb === 100))) {
        tableColumns.push(<td className='bg-danger'>{picks[j][i] + ' (' + weights[j][i] + ')'}</td>)
      } else {
        tableColumns.push(<td>{picks[j][i] + ' (' + weights[j][i] + ')'}</td>)
      }
    }
    tableRows.push(<tr>{tableColumns}</tr>)
  }

  //Add in total points row
  const tpColumns = []
  tpColumns.push([
    <td><b>Score:</b></td>,
    <td/>,
    <td/>,
    <td/>
  ])

  for (let person = 0; person < scores.length; person++) {

    tpColumns.push(<td>{scores[person]}</td>)

  }

  tableRows.push(<tr>{tpColumns}</tr>)

  //Add in win% row
  const wpColumns = []
  wpColumns.push([
    <td><b>WIN%</b></td>,
    <td/>,
    <td/>,
    <td/>
  ])

  let rand
  let winTeam
  const simWins = new Array(picks.length).fill(0)
  let gameWins
  const numSims = 5000
  //simulate numSims time
  for (let sim = 0; sim < numSims; sim++) {
    //reset out gameWins
    gameWins = new Array(picks.length).fill(0)
    //loop over each game
    for (let game = 0; game < homeTeams.length; game++) {
      //determine the winning team
      rand = Math.random() * 100
      if (rand < homeWinProbs[game]) {
        winTeam = homeTeams[game]
      } else {
        winTeam = awayTeams[game]
      }
      //Loop over each person and give them a game win if their pick matched simulated winning eam
      for (let person = 0; person < picks.length; person++) {
        if (picks[person][game] === winTeam) {
          gameWins[person] += weights[person][game]
        }
      }
    }
    //Fill out simWins
    const max = Math.max(...gameWins)
    const winArray = []
    //determine who won the simulated win
    for (let i = 0; i < gameWins.length; i++) {
      if (gameWins[i] === max) {
        winArray.push(i)
      }
    }
    //If multiple people got the same number of games correct. Split the win between them
    for (let i = 0; i < winArray.length; i++) {
      simWins[winArray[i]] += 1 / winArray.length
    }
  }
  //Add in each persons win percentage
  for (let person = 0; person < picks.length; person++) {
    wpColumns.push(<td>{Math.round(simWins[person] * 100 / numSims)}</td>)
  }

  tableRows.push(<tr>{wpColumns}</tr>)
  return tableRows
}
