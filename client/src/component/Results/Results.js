// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";


// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";
// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";
import {

  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Bar,
  ResponsiveContainer
} from "recharts";


// CSS
import "./Results.css";

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
      isElStarted: false,
      isElEnded: false,
      voterCount: undefined,
      voterName: "",
      voterPhone: "",
      voters: [],
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
    };
  }
  componentDidMount = async () => {
    // refreshing once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, ElectionInstance: instance, account: accounts[0] });

      // Get total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });
        // Total number of voters
        const voterCount = await this.state.ElectionInstance.methods
        .getTotalVoter()
        .call();
        this.setState({ voterCount: voterCount });

        // Loading all the voters
        for (let i = 0; i < this.state.voterCount; i++) {
        const voterAddress = await this.state.ElectionInstance.methods
          .voters(i)
          .call();
        const voter = await this.state.ElectionInstance.methods
          .voterDetails(voterAddress)
          .call();
        this.state.voters.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        });
        }
        this.setState({ voters: this.state.voters });

        // Loading current voters
        const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call();
        this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        },
        });
      // Loadin Candidates detials
      for (let i = 1; i <= this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i - 1)
          .call();
        this.state.candidates.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          voteCount: candidate.voteCount,
        });
      }

      this.setState({ candidates: this.state.candidates });

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <br />
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          )  : this.state.isElStarted && !this.state.isElEnded ? (
            <div className="container-item attention">
            <center>
              <h3>The election is being conducted at the movement.</h3>
              <p>Result will be displayed once the election has ended.</p>
              <p>Go ahead and cast your vote {"(if not already)"}.</p>
              <br />
              <Link
                to="/Voting"
                style={{ color: "white", textDecoration: "underline" }}
              >
                Voting Page
              </Link>
              <br />
              <br />
              <p>Or you can check the current standing</p>
              <Link
                to="/Standing"
                style={{ color: "white", textDecoration: "underline" }}
              >
                Standing
              </Link>
            </center>
          </div>
          
          ): !this.state.isElStarted && this.state.isElEnded ? (
            <div>
          {displayResults(this.state.candidates)}
          <div className="container-item info" style={{ display: "block" }}>
          <h3>REPORTS</h3>
              <table>
            <tr>
              <td>Total registered voters:</td>
              <td>{this.state.voters.length }</td>
            </tr>
            <tr>
              <td>Total number of voters who voted:</td>
              <td>{(this.state.voters.filter((ele)=>ele.hasVoted===true) ).length}</td>
            </tr>
            <tr>
              <td>Total number of voters who didn't</td>
              <td>{(this.state.voters.filter((ele)=>ele.hasVoted===false) ).length}</td>
            </tr>
          </table>
            </div>
          </div>

          ) : null}
        </div>
      </>
    );
  }
}

const candidcates_chart = (candidates) => {
 
  return (
    <div>
    <div style={{ textAlign: "center" }}>
      <h1 style={{ marginBottom: "30px" }}>Standing</h1>
      <div className="barchart">
      <ResponsiveContainer  width={550}
          height={350}>
        <BarChart
        
          data={candidates}
          margin={{
            top: 5,
            right: 30,
            left: 10,
            bottom: 5,
          }}
          barSize={20}
        >
          <XAxis 
            dataKey="header"
            stroke="white"
            scale="point"
            padding={{ left: 50, right: 10 }}
            
          />
          <YAxis   
          stroke="white" />
          
           <Tooltip/>
          <Legend />
          
          <CartesianGrid  strokeDasharray="3 3" />
          <Bar dataKey="voteCount"  barSize={50} fill="#009dc4" background={{ fill: "white" }} />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    </div>
  );
};
function displayWinner(candidates) {
  const getWinner = (candidates) => {
    // Returns an object having maxium vote count
    let maxVoteRecived = 0;
    let winnerCandidate = [];
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].voteCount > maxVoteRecived) {
        maxVoteRecived = candidates[i].voteCount;
        winnerCandidate = [candidates[i]];
      } else if (candidates[i].voteCount === maxVoteRecived) {
        winnerCandidate.push(candidates[i]);
      }
    }
    return winnerCandidate;
  };
  const renderWinner = (winner) => {
    return (
      <div style={{ backgroundColor: "#333" }} className="container-winner">
      <div className="winner-info">
        <p className="winner-tag">Winner!</p>
        <h2> {winner.header}</h2>
        <p className="winner-slogan">{winner.slogan}</p>
      </div>
      <div className="winner-votes">
        <div style={{ color: "white" }} className="votes-tag">Total Votes: </div>
        <div className="vote-count">{winner.voteCount}</div>
      </div>
    </div>
    );
  };
  const winnerCandidate = getWinner(candidates);
  return <>{winnerCandidate.map(renderWinner)}</>;
}

export function displayResults(candidates) {
  const renderResults = (candidate) => {
    return (
      <tr>
        <td  className="id"></td>
        <td>{candidate.id}</td>
        <td>{candidate.header}</td>
        <td>{candidate.voteCount}</td>
      </tr>
    );
  };
  return (
    <>
      {candidates.length > 0 ? (
        <div className="container-main">{displayWinner(candidates)}</div>
      ) : null}
      <div className="container-main" style={{ borderTop: "1px solid" }}>
        
        <h2>Total candidates: {candidates.length}</h2>
       
        {candidates.length < 1 ? (
          <div className="container-item attention">
            <center>No candidates.</center>
          </div>
        ) : (
          <>
            <div className="container-item">
              <table>
                <tr><th>Rank</th>
                  <th>Id</th>
                  <th>Candidate</th>
                  <th>Votes</th>
                </tr>
               {
                candidates.sort((candidate1, candidate2) => {
              return candidate2.voteCount - candidate1.voteCount;
              }).map(renderResults)
              }
              </table>
              
            </div>
      
            {candidates.length > 0 ? (
        <div className="container-item">{candidcates_chart (candidates)}</div>
      ) : null}
          </>
        )}
      </div>
    </>
  );
}
