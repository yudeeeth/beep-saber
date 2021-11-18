import React, { Component } from 'react';
import App from "./App.jsx";
import { setdefaultimage } from './Notes.js';
import { setdefault, setgameover, getgameover  } from "../utils/menu.js";
import songogg from "../assets/songs/homura/song.egg";
import songinfo from "../assets/songs/homura/Info.dat";
import songfile from "../assets/songs/homura/HardStandard.dat";
import "./choose.css";


class Choose extends React.Component {

    state = {
        start: false,
        roomcode: null,
        mapURL: "https://as.cdn.beatsaver.com/f65fb6890005d1f6b184c5aaf91c4f98737797ec.zip",
        mapId: "f65fb6890005d1f6b184c5aaf91c4f98737797ec",
        difficulty: "Hard",
        song: {},
        difficultyOptions: [],
        standardMaps: [],
        songLoaded: false,
        audio: null,
    };

    menuOrApp = () => {
        if (!(this.state.start ))
            {   
                // console.log("returning menu");
                // this.setState({start:false});
                return this.menu();
            }
        // setgameover(false);
        return <App key="vrstuff"
            song={this.state.song}
            mapId={this.state.mapId}
            isStarted={this.state.start}
            audio={this.state.audio}
            roomcode={this.state.roomcode}
        />;
    };

    handleURLChange = (event) => {
        this.setState({ mapURL: event.target.value });
    };

    setMapId = () => {
        let mapURL = this.state.mapURL;
        let mapId = mapURL.split("/")[3];
        if (mapId === undefined) return;
        mapId = mapId.split(".")[0];
        // console.log(mapId);
        this.setState({ mapId: mapId });
        this.readSongFiles(mapId);
    }

    fetchFile = async (mapId, fileName, callBack) => {
        let res = await fetch(`https://beep-saber.herokuapp.com/map/${mapId}/file/${fileName}`)
        callBack(res);
    };

    readSongFiles = async (mapId) => {
        let res = await fetch(`https://beep-saber.herokuapp.com/map/${mapId}`)
        let data = await res.text();
        await this.fetchFile(mapId, 'Info.dat', async (res) => {
            let data = await res.text();
            let song = JSON.parse(data);
            this.setState({ song: song });
            let standardMaps = song['_difficultyBeatmapSets'][0]['_difficultyBeatmaps'];
            standardMaps.forEach(map => {
                this.state.difficultyOptions.push(map['_difficulty'])
            });
            this.setState({ standardMaps: standardMaps });
            let audio = new Audio(`https://beep-saber.herokuapp.com/map/${mapId}/file/${song['_songFilename']}`);
            this.setState({ audio: audio });
        })
    }

    loadCurrentDifficulty = async (event) => {
        this.setState({ difficulty: event.target.value })
        let myMap = this.state.standardMaps.filter(beatmap => beatmap['_difficulty'] === this.state.difficulty)[0];
        let fileName = myMap['_beatmapFilename'];
        await this.fetchFile(this.state.mapId, fileName, async (res) => {
            let data = await res.text();
            let song = this.state.song;
            song = { ...song, ...JSON.parse(data) };
            this.setState({ song: song, songLoaded: true });
        })
    }

    menu = () => {
        return (
            <div className="inp">
                <div className="area" >
                        <ul className="circles">
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                        </ul>
                </div >
                <h1 className="tex">Instructions:</h1>
                <p className="bodytex">
                    1. Open https://beep-saber.herokuapp.com
                    <br />
                    2. Type in the roomcode shown below in that website
                    <br />
                    3. Press join in that website.
                    <br />
                    4. Press start in this website.
                </p>
                <div className="bodytex">The room code is : {this.getRoomcode()}.</div>
                <p className="bodytex">Start game as soon as you enter</p>
                <input type="checkbox" defaultChecked="true" onClick={setdefault} />
                <button className="btn" onClick={this.enterwithdefault}> Enter with default song </button>
                <h3 className="tex">Enter Map Link</h3>
                <input className="bodytex" type="text" value={this.state.mapURL} onChange={this.handleURLChange} />
                <button className="btn" onClick={this.setMapId}>Load Map</button>
                <p className="bodytex">{this.state.mapId != "" ? `Map ${this.state.mapId} Loaded.` : "Please Enter a Map Url"}</p>
                <h3 className="tex">Difficulty</h3>
                <select value={this.state.difficulty} onChange={(event) => this.setState({ difficulty: event.target.value })}>
                    {
                        this.state.difficultyOptions.map((difficulty) => {
                            return <option value={difficulty}>{difficulty}</option>
                        })
                    }
                </select>
                <button className="btn" onClick={this.loadCurrentDifficulty}>Load Difficulty</button>
                <br />
                <br />
                {
                    this.state.songLoaded ?
                        <button onClick={this.changeComponent}>Open Game</button>
                        : null
                }
            </div>
        );
    };

    enterwithdefault = async () => {
        let audio = new Audio(songogg);
        this.setState({ audio: audio });
        let infoFile = await fetch(songinfo);
        let infoText = await infoFile.text();
        let up = {...this.state.song,...JSON.parse(infoText)};
                this.setState({song:up});
        infoFile = await fetch(songfile);
        infoText = await infoFile.text();
        up = {...this.state.song,...JSON.parse(infoText)};
                this.setState({song:up});
        setdefaultimage(true);
        setgameover(this);
        this.setState({start:true});
    }

    getRoomcode = () => {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        alphabet = alphabet.split("");
        if (this.state.roomcode === null) {
            let code = [];
            for (let i = 0; i < 6; i++) {
                code.push(alphabet[Math.floor(Math.random() * 26)]);
            }
            // roomcode = [roomcode.slice(0,4).join(''),roomcode.slice(4).join('')].join('-');
            // console.log([code.slice(0,3).join(''),code.slice(3).join('')].join('-'));
            this.setState({ roomcode: [code.slice(0, 3).join(''), code.slice(3).join('')].join('-') });
        }
        return this.state.roomcode;
    };

    changeComponent = () => {
        setdefaultimage(false);
        this.setState({ start: true });
    };

    render() {
        return this.menuOrApp();
    }
}

export default Choose;
