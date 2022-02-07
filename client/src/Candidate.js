import React from "react";

export default class Candidate extends React.Component {

    vote() {
        const {drizzle} = this.props;
        const contract = drizzle.contracts.VotingMachine;

        // get and save the key for the variable we are interested in
        const stackId = contract.methods["vote"].cacheSend(this.props.address);
        this.setState({stackId});
    }

    render() {
        const address = this.props.address;
        return <div>
            {address}
            <button onClick={() => this.vote()}>Vote</button>
        </div>;
    }

}