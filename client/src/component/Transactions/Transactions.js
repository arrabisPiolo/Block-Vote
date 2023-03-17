// Node modules
import React, { Component } from "react";

import { Button } from "antd";
import { Table } from "antd";



// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";
// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";


// CSS
import "./Transactions.css";

export default class Transactions extends Component {
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
    const response = await fetch(
      "https://api.covalenthq.com/v1/97/address/0x07e02C0FDA0ace232Aca19561608d22Fe88f5216/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&key=ckey_0a90205ebee54ecfa0b3da470e6"
    );
    const result = await response.json();
    const data = result.data;
    const transactions = data.items;
    const transactionsFormatted = [];
    for (let i = 0; i < transactions.length; i++) {
      transactionsFormatted.push({
        key: `${i}`,
        TransactionHash: `${transactions[i].tx_hash}`,
        ViewTransaction: `https://testnet.bscscan.com/tx/${transactions[i].tx_hash}`,
        Timestamp: `${transactions[i].block_signed_at}`,
        From: `${transactions[i].from_address}`,
      });
    }
    this.setState({ transactionData: transactionsFormatted });
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
    const transactionColumns = [
      {
        title: "Transaction Hash",
        dataIndex: "TransactionHash",
        key: "TransactionHash",
      },
      {
        title: "Timestamp",
        dataIndex: "Timestamp",
        key: "Timestamp",
      },
      {
        title: "From",
        dataIndex: "From",
        key: "From",
      },
      {
        title: "Action",
        key: "Action",
        render: (text, record) => {
          return (
            
            <div className="buttonview">
              <Button 
                size="small"
                className="buttons"
                type="primary"
                onClick={() => window.open(record.ViewTransaction)}
              >
                View Transaction
              </Button>
            </div>
          );
        },
      },
    ];

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <br />
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          )  : this.state.isElStarted && !this.state.isElEnded ? (
            <div className="container-main">
            <div  style={{ textAlign: "center",alignItems:"center" }}>
            <Table
              columns={transactionColumns}
              dataSource={this.state.transactionData}
              pagination={{ position: "topRight", pageSize: 10, }}
            />
            </div>
            </div>
          ): !this.state.isElStarted && this.state.isElEnded ? (
            <div className="container-main">
            <div  style={{ textAlign: "center",alignItems:"center" }}>
            <Table
              columns={transactionColumns}
              dataSource={this.state.transactionData}
              pagination={{ position: "topRight", pageSize: 10, }}
            />
            </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }
}

