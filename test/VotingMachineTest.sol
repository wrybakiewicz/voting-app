pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/VotingMachine.sol";

contract VotingMachineTest {

    address contractAddress = address(this);

    function testInitialCandidateSetLength() public {
        VotingMachine votingMachine = VotingMachine(DeployedAddresses.VotingMachine());

        address[] memory candidates = votingMachine.getCandidates();
        Assert.equal(candidates.length, 0, "Candidates set should be empty at start");
    }

    function testAddCandidateWithNewAddress() public {
        VotingMachine votingMachine = VotingMachine(DeployedAddresses.VotingMachine());

        votingMachine.registerCandidate();

        address[] memory candidates = votingMachine.getCandidates();
        Assert.equal(candidates.length, 1, "New candidate should be added");
        Assert.equal(candidates[0], contractAddress, "First candidate address should be equal to contract address");
    }

    function testAddCandidateWhenAddressIsAlreadyACandidate() public {
        VotingMachine votingMachine = VotingMachine(DeployedAddresses.VotingMachine());

        votingMachine.registerCandidate();
        votingMachine.registerCandidate();

        address[] memory candidates = votingMachine.getCandidates();
        Assert.equal(candidates.length, 1, "There should be 1 candidate");
        Assert.equal(candidates[0], contractAddress, "Candidate address should be equal to contract address");
    }
}
