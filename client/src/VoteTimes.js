import React from "react";

export default class VoteTimes extends React.Component {
    state = {candidateRegistrationExpiration: null, voteStart: null, voteEnd: null};

    componentDidMount() {
        const {drizzle} = this.props;
        const contract = drizzle.contracts.VotingMachine;

        // get and save the key for the variable we are interested in
        const candidateRegistrationExpiration = contract.methods["candidateRegistrationExpiration"].cacheCall();
        const voteStart = contract.methods["voteStart"].cacheCall();
        const voteEnd = contract.methods["voteEnd"].cacheCall();
        this.setState({candidateRegistrationExpiration: candidateRegistrationExpiration, voteStart: voteStart, voteEnd: voteEnd});
    }

    render() {
        const {VotingMachine} = this.props.drizzleState.contracts;
        const candidateRegistrationExpiration = VotingMachine.candidateRegistrationExpiration[this.state.candidateRegistrationExpiration];
        const voteStart = VotingMachine.voteStart[this.state.voteStart];
        const voteEnd = VotingMachine.voteEnd[this.state.voteEnd];
        if (candidateRegistrationExpiration && voteStart && voteEnd) {
            return <div>
                <h3>Vote times:</h3>
                <p>Candidate registration until: {this.getFormattedDate(candidateRegistrationExpiration.value)}</p>
                <p>Vote start at: {this.getFormattedDate(voteStart.value)}</p>
                <p>Vote end at: {this.getFormattedDate(voteEnd.value)}</p>
            </div>
        }
        return <div></div>;
    }

    getFormattedDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString("en-US");
    }

}