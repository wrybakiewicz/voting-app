import React from "react";

export default class CurrentWinner extends React.Component {
    state = {dataKey: null};

    componentDidMount() {
        const {drizzle} = this.props;
        const contract = drizzle.contracts.VotingMachine;

        // get and save the key for the variable we are interested in
        const dataKey = contract.methods["winner"].cacheCall();
        this.setState({dataKey});
    }

    render() {
        const {VotingMachine} = this.props.drizzleState.contracts;
        const winner = VotingMachine.winner[this.state.dataKey];
        if (winner) {
            return <div>
                <h3>Current winner:</h3>
                <p>Address: {winner.value[0]}</p>
                <p>Vote count: {winner.value[1]}</p>
            </div>
        }
        return <div></div>;
    }

}