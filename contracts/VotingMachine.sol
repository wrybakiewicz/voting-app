pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract VotingMachine {

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private candidates;

    uint public candidateRegistrationExpiration;
    uint public voteStart;
    uint public voteEnd;

    event CandidateAdded(address candidate);

    error CandidateRegistrationEnded();
    error ConstructorDurationsNotValid();

    constructor(uint durationToCandidateRegistrationEnd, uint durationToStartVote, uint durationToEndVote) {
        if (durationToStartVote > durationToEndVote || durationToCandidateRegistrationEnd > durationToEndVote) {
            revert ConstructorDurationsNotValid();
        }
        candidateRegistrationExpiration = block.timestamp + durationToCandidateRegistrationEnd;
        voteStart = block.timestamp + durationToStartVote;
        voteEnd = block.timestamp + durationToEndVote;
    }

    modifier isCandidateRegistrationTime() {
        if (block.timestamp >= candidateRegistrationExpiration) {
            revert CandidateRegistrationEnded();
        }
        _;
    }

    //TODO: one user can vote for one candidate


    function registerCandidate() external isCandidateRegistrationTime {
        bool candidateAdded = candidates.add(msg.sender);
        if (candidateAdded) {
            emit CandidateAdded(msg.sender);
        }
    }

    function getCandidates() public view returns (address[] memory) {
        return candidates.values();
    }
}
