import React, { Component } from 'react';
import App from "./App.jsx";

class Choose extends React.Component {
    
    state = {
        start: false,
        roomcode: null,
    };

    menuOrApp = () => {
        if(!this.state.start)
            return this.menu();
        return <App key="vrstuff"/>;
    };
    
    menu = () => {
        return (
            <div>
                <h1>Instructions:</h1>
                <p>
                    1. Open https://beep-saber.herokuapp.com 
                    <br />
                    2. Set colors of balls in that site 
                    <br />
                    3. Type in the roomcode shown below in that website 
                    <br />
                    4. Press join in that website. 
                    <br />
                    5. Press start in this website.
                </p>
                <div>Hello the roomcode is : {this.getRoomcode()}.</div>
                <button onClick={this.changeComponent}>Open Game</button>
            </div>
        );
    };

    getRoomcode = () => {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        alphabet = alphabet.split("");
        if(this.state.roomcode === null) {
            let code = [];
            for(let i=0;i<6;i++){
                code.push(alphabet[Math.floor(Math.random()*  26)]);
            }
            // roomcode = [roomcode.slice(0,4).join(''),roomcode.slice(4).join('')].join('-');
            // console.log([code.slice(0,3).join(''),code.slice(3).join('')].join('-'));
            this.setState({roomcode:[code.slice(0,3).join(''),code.slice(3).join('')].join('-')} );
        }
        return this.state.roomcode;
    };

    changeComponent = () => {
        this.setState({start: true});
    };

    render() { 
        return this.menuOrApp();
    }
}
 
export default Choose;