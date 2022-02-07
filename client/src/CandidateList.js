import React from "react";
import Candidate from "./Candidate";

export default class CandidateList extends React.Component {
    state = {candidates: null};

    componentDidMount() {
        const {drizzle} = this.props;
        const contract = drizzle.contracts.VotingMachine;

        // get and save the key for the variable we are interested in
        const candidates = contract.methods["getCandidates"].cacheCall();
        this.setState({candidates});
    }

    render() {
        const {VotingMachine} = this.props.drizzleState.contracts;
        const candidates = VotingMachine.getCandidates[this.state.candidates];
        if (candidates) {
            return <div>
                <h3>Candidates:</h3>
                {candidates.value.map((candidate, index) => <Candidate drizzle={this.props.drizzle}
                                                                       drizzleState={this.props.drizzleState}
                                                                       address={candidate} key={index}/>)}
            </div>
        }
        return <div></div>;
    }

    getFormattedDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString("en-US");
    }

}