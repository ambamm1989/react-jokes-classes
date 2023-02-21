import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };

  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    };
  
    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.resetVote = this.resetVote.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.vote = this.vote.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
  }

  componentDidUpdate() {
    if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
  }

  async getJokes() {
    try {
      let jokes = this.state.jokes;
      let jokeVotes = JSON.parse(window.localStorage.getItem('jokeVotes') || '{}');
    
      let seenJokes = new Set(jokes.map(j => j.id));

      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get('https://icanhazdadjoke.com/', {
          headers: {
            Accept: 'application/json'}
          });
          let { status, ...joke } = res.data;

          if (!seenJokes.has(joke.id)) {
            seenJokes.add(joke.id);
            jokeVotes[joke.id] = jokeVotes[joke.id] || 0;
            jokes.push({...joke, votes: jokeVotes[joke.id], locked: false });
          } else {
            console.log('Duplicate found!');
          }
        }

        this.setState({ jokes });
        window.localStorage.setItem('jokeVotes', JSON.stringify(jokeVotes));
      } catch (e) {
        console.log(e);
      }
    }

    generateNewJokes() {
      this.setState(st => ({jokes: st.jokes.filter(j =>!j.locked)}));
    }

    resetVote() {
      window.localStorage.setItem('jokeVotes', '{}');
      this.setState(st => ({jokes: st.jokes.map(joke => ({...joke, votes: 0}))
    }));
  }

  vote(id, delta) {
    let jokesVotes = JSON.parse(window.localStorage.getItem('jokeVotes'));
    jokesVotes[id] = (jokesVotes[id] || 0) + delta;
    window.localStorage.setItem('jokeVotes', JSON.stringify(jokesVotes));
    this.setState(st => ({jokes: st.jokes.map(j => j.id === id? {...j, votes: j.votes + delta} : j
    )
  }));
}

  toggleLock(id) {
    this.setState(st => ({jokes: st.jokes.map(j => (j.id === id ? {...j, locked: !j.locked} : j))
  }));
}

  render() {
    let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);
    let allLocked
      sortedJokes.filter(j => j.locked).length === this.props.numJokesToGet

      return (
        <div className='JokeList'>
          <button
            className='JokeList-getmore'
            onClick={this.generateNewJokes}
            disabled={allLocked}
            >
              Get New Jokes
            </button>
            <button className='JokeList-getmore' onClick={this.resetVote}>
              Reset Vote Counts 
            </button>

            {sortedJokes.map(j => (
              <Joke
                 test={j.joke}
                 key={j.id}
                 id={j.id}
                 votes={j.votes}
                 vote={this.vote}
                 locked={j.locked}
                 toggleLock={this.toggleLock}
                 />
            ))}

            {sortedJokes.length > this.props.numJokesToGet ? (
              <div className='loading'>
                <i className='fa fa-4x fa-spinner fa-spin' />
              </div>
            ) : null}
          </div>
      );
    }
  }

  export default JokeList;