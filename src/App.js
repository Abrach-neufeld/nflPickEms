import React from 'react'
import './App.css'
import Standings from './Standings'
import PickMaker from './PickMaker'
import football from './images/football.jpeg'
// import winnerPhoto from './images/Zach.jpg'
import {Button, Image, Container, Row, Col} from 'react-bootstrap'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { HashRouter, Link, Route } from 'react-router-dom'
import moment from 'moment'

const firebaseConfig = {
  apiKey: "AIzaSyBWzWqAPP_HGNxeMD2eAl7AsLBpKxVo8Kw",
  authDomain: "nfl-pickems-5e76c.firebaseapp.com",
  databaseURL: "https://nfl-pickems-5e76c.firebaseio.com",
  projectId: "nfl-pickems-5e76c",
  storageBucket: "nfl-pickems-5e76c.appspot.com",
  messagingSenderId: "776648999019",
  appId: "1:776648999019:web:eebdde7de73e9e4894f12e"
}
firebase.initializeApp(firebaseConfig)

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      submissionLock: true,
      lockTime: null
    }
  }

  componentDidMount() {
    const db = firebase.firestore()
    db.collection('weeks').get().then((snapshot) => {
      const submissionLock = snapshot.docs[snapshot.size - 1].get('submissionLock')
      const now = Date.now() / 1000
      const lockTime = moment.unix(submissionLock.seconds)
      this.setState({
        submissionLock: now > submissionLock.seconds,
        lockTime
      })
    })
  }

  renderContent = () => {
    if (this.state.submissionLock) {
      return (
        <Row className='mb-3'>
          <Col>
            <Standings/>
          </Col>
        </Row>
      )
    } else {
      const timeFormat = "dddd MM/DD [at] h:mma"
      return (
        <Row className='mb-3'>
          <Col>
            <h3>Time to make your picks!</h3>
            <p>
              Picks lock for the week on {this.state.lockTime.format(timeFormat)}. After this time, you will be able to
              see everyone's picks and odds.
            </p>
            <Link to='/picker' component={Button} size='lg' disabled={this.state.submissionLock}>Make Picks</Link>
          </Col>
        </Row>
      )
    }
  }

  render() {
    return (
      <Container className='App'>
        <Row className='header'>
          <Col sm='auto'>
            <Image src={football} alt='football' className='football'/>
          </Col>
          <Col>
            <h1> NFL PickEms </h1>
            {/*<div className='winnerDiv'>*/}
            {/*  <Image roundedCircle src={winnerPhoto} alt='Zach' className='winnerImg'/>*/}
            {/*  <h5> Reigning Champ: Zach Frischer </h5>*/}
            {/*</div>*/}
          </Col>
          <Col sm='auto'>
            <Image src={football} alt='football' className='football'/>
          </Col>
        </Row>
        {this.renderContent()}
      </Container>
    )
  }
}

function Router() {
  return (
    <HashRouter basename='/'>
      <Route exact path='/' component={App} />
      <Route path='/picker' component={PickMaker} />
    </HashRouter>
  )
}

export default Router
