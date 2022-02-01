pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract VotingMachine {

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private candidates;

    event CandidateAdded(address);

    //TODO: there is a time when candidates can register

    //TODO: one user can vote for one candidate

    //TODO: there is a start & end of the voting

    function registerCandidate() external {
        bool candidateAdded = candidates.add(msg.sender);
        if (candidateAdded) {
            emit CandidateAdded(msg.sender);
        }
    }

    function getCandidates() public view returns (address[] memory) {
        return candidates.values();
    }
}
