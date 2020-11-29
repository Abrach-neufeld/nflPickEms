import React from 'react'
import axios from 'axios'
import {Table} from 'react-bootstrap'
import './Standings.css'
import firebase from 'firebase/app'
import 'firebase/firestore'

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event='

export default class Standings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: null,
      players: []
    }
  }

  componentDidMount() {
    this.generateTableData()
  }

  generateTableData = async () => {
    const table = await getTable()
    this.setState({
      tableData: table.data,
      players: table.players
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

          {this.state.players.map((player) => (
            <th>{player}</th>
          ))}
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
  const response = await axios.get(BASE_URL + gameID)
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


async function getTable() {
  const db = firebase.firestore()
  const currentWeek = await db.collection('weeks').get().then((snapshot) => {
    return snapshot.docs[snapshot.size - 1].ref.collection('games')
  })
  const gameIDs = await currentWeek.get().then((gamesSnapshot) => {
      return gamesSnapshot.docs.map(doc => doc.id)
  })

  const picks = []
  const weights = []

  const players = await db.collection('players').get().then((snapshot) => {
    return snapshot.docs.map(doc => doc.id)
  })
  const playerIndices = {}
  for (let i = 0; i < players.length; i++) {
    playerIndices[players[i]] = i
    picks[i] = []
    weights[i] = []
  }

  const promises = []
  for (let i = 0; i < gameIDs.length; i++) {
    const gameID = gameIDs[i]
    promises.push(currentWeek.doc(gameID).collection('picks').get().then((snapshot) => {
      snapshot.forEach((docSnapshot) => {
        const name = docSnapshot.id
        const index = playerIndices[name]
        const pickInfo = docSnapshot.data()
        picks[index][i] = pickInfo.pick
        weights[index][i] = pickInfo.weight
      })
    }))
  }

  await Promise.all(promises)

  //Initialize empty lists/arrays
  const scores = new Array(picks.length).fill(0)
  const homeWinProbs = []
  const awayTeams = []
  const homeTeams = []
  const rows = []
  let gm

  //Loop over each game url
  for (let i = 0; i < gameIDs.length; i++) {
    //get game object and add to rows
    gm = await getWinProb(gameIDs[i])
    rows.push(gm)
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
      const pickText = picks[j][i] ? picks[j][i] + ' (' + weights[j][i] + ')' : 'X'
      if (((picks[j][i] === rows[i].homeTeam) && (rows[i].homeWinProb === 100)) || ((picks[j][i] === rows[i].awayTeam) && (rows[i].awayWinProb === 100))) {
        tableColumns.push(<td className='bg-success'>{pickText}</td>)
        scores[j] += weights[j][i]
      } else if (((picks[j][i] === rows[i].awayTeam) && (rows[i].homeWinProb === 100)) || ((picks[j][i] === rows[i].homeTeam) && (rows[i].awayWinProb === 100))) {
        tableColumns.push(<td className='bg-danger'>{pickText}</td>)
      } else {
        tableColumns.push(<td>{pickText}</td>)
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
  return {
    data: tableRows,
    players
  }
}
