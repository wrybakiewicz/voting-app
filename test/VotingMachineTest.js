const truffleAssert = require('truffle-assertions');

const VotingMachine = artifacts.require("VotingMachine");

contract("test adding candidates", async accounts => {
    const account1 = accounts[0];
    const account2 = accounts[1];
    let votingMachine;

    before(async () => {
        votingMachine = await VotingMachine.deployed();
    });


    it("should return 0 when no candidate added", async () => {
        const candidates = await votingMachine.getCandidates();

        assert.equal(candidates.length, 0);
    });

    it("should register new candidate and emit event", async () => {
        const registerCandidateResult = await votingMachine.registerCandidate({from: account1});

        const candidates = await votingMachine.getCandidates();
        assert.equal(candidates.length, 1);
        assert.equal(candidates[0], account1);
        truffleAssert.eventEmitted(registerCandidateResult, "CandidateAdded", {candidate: account1})
    });

    it("should return same candidate list as before when candidate already registered", async () => {
        const registerCandidateResult = await votingMachine.registerCandidate({from: account1});

        const candidates = await votingMachine.getCandidates();
        assert.equal(candidates.length, 1);
        assert.equal(candidates[0], account1);
        truffleAssert.eventNotEmitted(registerCandidateResult, "CandidateAdded")
    });

    it("should register second candidate and emit event", async () => {
        const registerCandidateResult = await votingMachine.registerCandidate({from: account2});

        const candidates = await votingMachine.getCandidates();
        assert.equal(candidates.length, 2);
        assert.equal(candidates[0], account1);
        assert.equal(candidates[1], account2);
        truffleAssert.eventEmitted(registerCandidateResult, "CandidateAdded", {candidate: account2})
    });

});