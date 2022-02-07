import React from "react";

export default class RegisterCandidate extends React.Component {
    state = {stackId: null};

    registerCandidate() {
        const {drizzle} = this.props;
        const contract = drizzle.contracts.VotingMachine;

        // get and save the key for the variable we are interested in
        const stackId = contract.methods["registerCandidate"].cacheSend();
        this.setState({stackId});
    }

    getTxStatus() {
        const {transactions, transactionStack} = this.props.drizzleState;
        const txHash = transactionStack[this.state.stackId];
        if (!txHash || !transactions[txHash]) {
            return null;
        }

        return `Transaction status: ${transactions[txHash] && transactions[txHash].status}`;
    }

    render() {
        const {VotingMachine} = this.props.drizzleState.contracts;
        return <div>
            <h3>Register as candidate:</h3>
            <button onClick={() => this.registerCandidate()}>Register</button>
            <div>{this.getTxStatus()}</div>
        </div>
    }

}