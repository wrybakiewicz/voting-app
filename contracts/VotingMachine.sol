pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract VotingMachine {

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private candidates;

    uint public candidateRegistrationExpiration;
    uint public voteStart;
    uint public voteEnd;

    mapping(address => bool) haveVoted;
    //TODO: map candidate => vote count

    event CandidateAdded(address candidate);

    error CandidateRegistrationEnded();
    error ConstructorDurationsNotValid();
    error VoteTimeNotStarted();
    error VoteTimeEnded();
    error AddressHaveVoted();
    error VoteAddressIsNotCandidate();

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

    modifier isTimeToVote() {
        if (block.timestamp < voteStart) {
            revert VoteTimeNotStarted();
        } else if (block.timestamp > voteEnd) {
            revert VoteTimeEnded();
        }
        _;
    }

    modifier isCandidate(address candidate) {
        if(!candidates.contains(candidate)) {
            revert VoteAddressIsNotCandidate();
        }
        _;
    }

    modifier haveNotVoted() {
        if (haveVoted[msg.sender]) {
            revert AddressHaveVoted();
        }
        _;
    }

    function registerCandidate() external isCandidateRegistrationTime {
        bool candidateAdded = candidates.add(msg.sender);
        if (candidateAdded) {
            emit CandidateAdded(msg.sender);
        }
    }

    function getCandidates() public view returns (address[] memory) {
        return candidates.values();
    }

    //TODO: one user can vote for one candidate
    function vote(address candidate) external isTimeToVote haveNotVoted isCandidate(candidate) {
        haveVoted[msg.sender] = true;
    }
}
