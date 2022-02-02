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

contract("test adding candidate after candidate registration time", async accounts => {
    const account = accounts[0];

    it("should revert when register after registration end", async () => {
        const votingMachine = await VotingMachine.new(0, 1, 2);

        await truffleAssert.reverts(votingMachine.registerCandidate({from: account}));
    });

    it("should register when registered before registration end", async () => {
        const votingMachine = await VotingMachine.new(500, 1000, 2000);

        const registerCandidateResult = await votingMachine.registerCandidate({from: account});

        const candidates = await votingMachine.getCandidates();
        assert.equal(candidates.length, 1);
        assert.equal(candidates[0], account);
        truffleAssert.eventEmitted(registerCandidateResult, "CandidateAdded", {candidate: account})
    });
});

contract("test constructor durations: candidate registration end, vote start, vote end", async accounts => {
    const account = accounts[0];

    it("should not revert when candidate registration < vote start < vote end", async () => {
        await VotingMachine.new(0, 1, 2);
    });

    it("should not revert when vote start < candidate registration < vote end", async () => {
        await VotingMachine.new(1, 0, 2);
    });

    it("should revert when vote end > candidate registration", async () => {
        await truffleAssert.reverts(VotingMachine.new(3, 1, 2, {from: account}));
    });

    it("should revert when vote start > vote end", async () => {
        await truffleAssert.reverts(VotingMachine.new(0, 2, 1, {from: account}));
    });
});