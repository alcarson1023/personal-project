import React, { Component } from 'react';
import axios from 'axios'

export default class HomePage extends Component{

  testFeature(){
        axios.get('/api/test')
        // .then(response => console.log(response.data))
        // console.log(currentTrack)  //trying to get album cover
      }

    render(){
      return (
          <div>
            {/* <div className='playlist'><img /><p>The 19X0's</p> */}
        <p>This is the Home page</p>
        {/* <button className='button' onClick={() => this.testFeature()}>THE BUTTON OF MANY TESTS</button> */}
{/* </div> */}
  </div>
)
    }
  }