import React from 'react'
import {Container, Row, Col, Card, CardDeck, Image, Form, Button} from 'react-bootstrap'
import axios from 'axios'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import './PickMaker.css'
import firebase from 'firebase/app'
import 'firebase/firestore'
import {withRouter} from 'react-router-dom'

class PickMaker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingGames: true,
      submissionLock: true,
      games: [],
      picks: {},
      pickOrder: [],
      name: '',
      week: null,
      players: [],
      canSubmit: true
    }
  }

  async componentDidMount() {
    const promises = []
    const db = firebase.firestore()
    const week = await db.collection('weeks').get().then((snapshot) => {
      return snapshot.docs[snapshot.size - 1].id
    })
    this.setState({ week })
    promises.push(this.loadGameData(week))
    promises.push(db.collection('players').get().then((snapshot) => {
      this.setState({
        players: snapshot.docs.map(doc => doc.id)
      })
    }))
    promises.push(db.collection('weeks').doc(week).get().then((snapshot) => {
      const submissionLock = snapshot.get('submissionLock')
      const now = Date.now() / 1000
      this.setState({
        submissionLock: now > submissionLock.seconds
      })
    }))
    Promise.all(promises).then(() => this.setState({loadingGames: false}))
  }

  submitPicks = () => {
    this.setState({canSubmit: false})
    if (this.state.submissionLock) {
      alert('Submissions are locked for the week.')
    } else if (this.state.pickOrder.length !== this.state.games.length) {
      alert('You must make a pick for every game.')
      this.setState({canSubmit: true})
    } else {
      const db = firebase.firestore()
      const gamesCollection = db.collection('weeks').doc(this.state.week).collection('games')
      const promises = []
      for (let i = 0; i < this.state.pickOrder.length; i++) {
        const pick = this.state.pickOrder[i]
        gamesCollection.doc(pick.gameID).set({gameID: pick.gameID})
        promises.push(gamesCollection.doc(pick.gameID).collection('picks').doc(this.state.name).set({
          pick: pick.team.abbr,
          weight: this.state.pickOrder.length - i
        }))
      }
      Promise.all(promises).then(() => this.props.history.push('/')).catch(() => this.setState({canSubmit: true}))
    }
  }

  loadGameData = async (week) => {
    const response = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}`)
    const games = response.data.events
    const gameData = []
    for (const game of games) {
      const teams = game.competitions[0].competitors
      const teamData = []
      for (let team of teams) {
        team = team.team
        teamData.push({
          name: team.name,
          abbr: team.abbreviation,
          color: team.color,
          logo: team.logo
        })
      }
      gameData.push({
        id: game.id,
        teams: teamData
      })
    }
    this.setState({ games: gameData })
  }

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const pickOrder = this.reorder(
      this.state.pickOrder,
      result.source.index,
      result.destination.index
    )

    this.setState({
      pickOrder
    })
  }

  setPick = (gameID, team, opposingTeam) => {
    const newOrder = this.state.pickOrder.filter(item => item.gameID !== gameID)
    newOrder.push({
      gameID,
      team,
      opposingTeam
    })
    this.setState({
      picks: {
        ...this.state.picks,
        [gameID]: team.abbr
      },
      pickOrder: newOrder
    })
  }

  renderTeamCard = (team, gameID, opposingTeam) => {
    return (
      <Card border={this.state.picks[gameID] === team.abbr ? 'success' : ''} className='teamCard mb-3' onClick={() => this.setPick(gameID, team, opposingTeam)}>
        <Card.Body>
          <Row className='cardContent'>
            <Col><Image src={team.logo} className='teamLogo'/></Col>
            <Col><Card.Title>{team.abbr}</Card.Title></Col>
          </Row>
        </Card.Body>
      </Card>
    )
  }

  renderPickForm = () => {
    const rows = []
    for (const game of this.state.games) {
      rows.push(
        <Row>
          <CardDeck style={{alignItems: 'center'}}>
            {this.renderTeamCard(game.teams[0], game.id, game.teams[1])}
            <h3>vs</h3>
            {this.renderTeamCard(game.teams[1], game.id, game.teams[0])}
          </CardDeck>
        </Row>
      )
    }
    return rows
  }

  renderOrderer = () => {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId='droppable'>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {this.state.pickOrder.map((item, index) => (
                <Draggable key={item.gameID} draggableId={item.gameID} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className='mb-3'
                    >
                      <Card.Body>
                        <Row className='cardContent'>
                          <Col><Image src={item.team.logo} className='teamLogo'/></Col>
                          <Col><Card.Title>{item.team.abbr} over {item.opposingTeam.abbr}</Card.Title></Col>
                          <Col><Image src={item.opposingTeam.logo} className='teamLogo'/></Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  }

  renderForm = () => {
    return (
      <Container>
        <Row className='mt-4'>
          <Col/>
          <Col>
            <h2 style={{textAlign: 'center'}}>PickMaker™</h2>
          </Col>
          <Col style={{justifyContent: 'flex-end', display: 'flex'}}>
            <Button size='lg' onClick={this.submitPicks} variant='primary'
                    disabled={!this.state.canSubmit || this.state.submissionLock}>Submit</Button>
          </Col>
        </Row>
        <Row style={{justifyContent: 'center'}} className='mt-3'>
          <Form.Group>
            <Form.Label>Who are you?</Form.Label>
            <Form.Control custom as='select' onChange={event => this.setState({name: event.target.value})} >
              {this.state.players.map((player) => (
                <option>{player}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Row>
        <Row className='mt-3 mb-3'>
          <Col>
            <h4 style={{textAlign: 'center'}}>Pick game winners</h4>
          </Col>
          <Col>
            <h4 style={{textAlign: 'center'}}>Sort picks by confidence</h4>
          </Col>
        </Row>
        <Row>
          <Col>
            {this.renderPickForm()}
          </Col>
          <Col>
            {this.renderOrderer()}
          </Col>
        </Row>
      </Container>
    )
  }

  render() {
    if (this.state.loadingGames) return null
    return this.renderForm()
  }
}

export default withRouter(PickMaker)