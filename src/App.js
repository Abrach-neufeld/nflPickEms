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
        <h1> NFL PickEms </h1>
        <Image src={football} alt='football' className='football'/>
      </div>

      <Standings/>

      <div>
        <h1> Reigning Champ: Zach Frischer </h1>
      </div>
      <div>
        <Image roundedCircle src={winnerPhoto} alt='Zach' className='winnerImg'/>
      </div>
    </div>
  );
}

export default App;
