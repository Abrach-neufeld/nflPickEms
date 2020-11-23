import React from 'react'
import './App.css'
import Standings from './Standings'
import PickMaker from './PickMaker'
import football from './images/football.jpeg'
import winnerPhoto from './images/Zach.jpg'
import {Button, Image, Container, Row, Col} from 'react-bootstrap'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { HashRouter, Link, Route } from 'react-router-dom'

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
      submissionLock: true
    }
  }

  componentDidMount() {
    const db = firebase.firestore()
    db.collection('weeks').get().then((snapshot) => {
      const submissionLock = snapshot.docs[snapshot.size - 1].get('submissionLock')
      const now = Date.now() / 1000
      this.setState({
        submissionLock: now > submissionLock.seconds
      })
    })
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
            <div className='winnerDiv'>
              <Image roundedCircle src={winnerPhoto} alt='Zach' className='winnerImg'/>
              <h5> Reigning Champ: Zach Frischer </h5>
            </div>
          </Col>
          <Col sm='auto'>
            <Image src={football} alt='football' className='football'/>
          </Col>
        </Row>
        <Row className='mt-3 mb-3'>
          <Col style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Link to='/picker' component={Button} disabled={this.state.submissionLock}>Make Picks</Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <Standings/>
          </Col>
        </Row>
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
