import React from "react";
import {DrizzleContext} from "@drizzle/react-plugin";
import CurrentWinner from "./CurrentWinner";
import VoteTimes from "./VoteTimes";
import CandidateList from "./CandidateList";
import RegisterCandidate from "./RegisterCandidate";

export default () => (
    <DrizzleContext.Consumer>
        {drizzleContext => {
            const {drizzle, drizzleState, initialized} = drizzleContext;

            if (!initialized) {
                return "Loading...";
            }

            return (
                <div>
                    <RegisterCandidate drizzle={drizzle} drizzleState={drizzleState} />
                    <CandidateList drizzle={drizzle} drizzleState={drizzleState} />
                    <VoteTimes drizzle={drizzle} drizzleState={drizzleState}/>
                    <CurrentWinner drizzle={drizzle} drizzleState={drizzleState}/>
                </div>
            );
        }}
    </DrizzleContext.Consumer>
)