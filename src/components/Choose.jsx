import React, { Component } from 'react';
import App from "./App.jsx";

class Choose extends React.Component {
    
    state = {
        start: false,
        roomcode: null,
        mapURL: "",
        mapId : "f65fb6890005d1f6b184c5aaf91c4f98737797ec",
        difficulty: "Hard",
    };

    menuOrApp = () => {
        if(!this.state.start)
            return this.menu();
        return <App key="vrstuff" mapId = {this.state.mapId} difficulty={this.state.difficulty}/>;
    };

    handleURLChange = (event) => {
        this.setState({mapURL: event.target.value});
    };
    
    setMapId = () => {
        let mapURL = this.state.mapURL;
        let mapId = mapURL.split("/")[3];
        if(mapId === undefined) return;
        mapId = mapId.split(".")[0];
        console.log(mapId);
        this.setState({mapId: mapId});
    }

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
                <h3>Enter Map Link</h3>
                <input type="text" value={this.state.mapURL} onChange={this.handleURLChange}/>
                <button onClick={this.setMapId}>Load Map</button>
                <p>{this.state.mapId!=""?`Map ${this.state.mapId} Loaded.`:"Please Enter a Map Url"}</p>
                <h3>Difficulty</h3>
                <select value={this.state.difficulty} onChange={(event) => this.setState({difficulty: event.target.value})}>
                    <option value="Easy">Easy</option>
                    <option value="Normal">Normal</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                    <option value="ExpertPlus">Expert+</option>
                    <option value="ExpertPlusPlus">Expert++</option>
                </select>
                <br />
                <br />
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