import React from 'react'
import './App.css'
import Standings from './Standings'
import football from './images/football.jpeg'
import winnerPhoto from './images/Zach.jpg'
import {Image} from 'react-bootstrap'

function App() {
  return (
    <div className='App'>
      <div className='header'>
        <Image src={football} alt='football' className='football'/>
        <div>
          <h1> NFL PickEms </h1>
          <div className='winnerDiv'>
            <Image roundedCircle src={winnerPhoto} alt='Zach' className='winnerImg'/>
            <h5> Reigning Champ: Zach Frischer </h5>
          </div>
        </div>
        <Image src={football} alt='football' className='football'/>
      </div>
      <Standings/>
    </div>
  );
}

export default App;
