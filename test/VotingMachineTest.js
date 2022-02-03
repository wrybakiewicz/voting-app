const truffleAssert = require('truffle-assertions');
const {time} = require('@openzeppelin/test-helpers');

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

contract("test constructor durations: candidate registration end, vote start, vote end", async _ => {
    it("should not revert when candidate registration < vote start < vote end", async () => {
        await VotingMachine.new(0, 1, 2);
    });

    it("should not revert when vote start < candidate registration < vote end", async () => {
        await VotingMachine.new(1, 0, 2);
    });

    it("should revert when vote end > candidate registration", async () => {
        await truffleAssert.reverts(VotingMachine.new(3, 1, 2, {gas: 999999}));
    });

    it("should revert when vote start > vote end", async () => {
        await truffleAssert.reverts(VotingMachine.new(0, 2, 1, {gas: 999999}));
    });
});

contract("test voting", accounts => {
    const account1 = accounts[0];
    const account2 = accounts[1];
    const account3 = accounts[2];

    it("should not let vote for candidate if try to vote before start", async () => {
        const votingMachine = await VotingMachine.new(3, 5, 10);
        await votingMachine.registerCandidate({from: account1});

        await truffleAssert.reverts(votingMachine.vote(account2, {from: account1}));
    });

    it("should not let vote for candidate if try to vote after end", async () => {
        const votingMachine = await VotingMachine.new(5, 0, 10);
        await votingMachine.registerCandidate({from: account1});
        await time.increase(15);
        await time.advanceBlock();

        await truffleAssert.reverts(votingMachine.vote(account2, {from: account1}));
    });


    it("should let vote for candidate if vote after start before end", async () => {
        const votingMachine = await VotingMachine.new(2, 0, 10);
        await votingMachine.registerCandidate({from: account1});

        const voteResult = await votingMachine.vote(account1, {from: account2});

        const returnedWinner = await votingMachine.winner();
        assert.equal(returnedWinner.winnerAddress, account1);
        assert.equal(returnedWinner.voteCount, 1);
        truffleAssert.eventEmitted(voteResult, "Voted", {candidate: account1});
        truffleAssert.eventEmitted(voteResult, "NewWinner", (winner) => {
            return winner[0].winnerAddress === account1 && winner[0].voteCount === '1';
        });
    });

    it("should let vote for two different candidates", async () => {
        const votingMachine = await VotingMachine.new(2, 0, 10);
        await votingMachine.registerCandidate({from: account1});
        await votingMachine.registerCandidate({from: account2});

        const voteResult1 = await votingMachine.vote(account2, {from: account1});
        const voteResult2 = await votingMachine.vote(account1, {from: account2});

        const winner = await votingMachine.winner();
        assert.equal(winner.winnerAddress, account2);
        assert.equal(winner.voteCount, 1);
        truffleAssert.eventEmitted(voteResult1, "Voted", {candidate: account2});
        truffleAssert.eventEmitted(voteResult1, "NewWinner", (winner) => {
            return winner[0].winnerAddress === account2 && winner[0].voteCount === '1';
        });
        truffleAssert.eventEmitted(voteResult2, "Voted", {candidate: account1});
        truffleAssert.eventNotEmitted(voteResult2, "NewWinner");
    });

    it("should not let vote 2 times", async () => {
        const votingMachine = await VotingMachine.new(2, 0, 10);
        await votingMachine.registerCandidate({from: account1});
        await votingMachine.registerCandidate({from: account3});

        await votingMachine.vote(account1, {from: account2});
        await truffleAssert.reverts(votingMachine.vote(account3, {from: account2}));
    });

    it("should let 2 voters for 1 candidate", async () => {
        const votingMachine = await VotingMachine.new(2, 0, 10);
        await votingMachine.registerCandidate({from: account3});

        const voteResult1 = await votingMachine.vote(account3, {from: account1});
        const voteResult2 = await votingMachine.vote(account3, {from: account2});

        const winner = await votingMachine.winner();
        assert.equal(winner.winnerAddress, account3);
        assert.equal(winner.voteCount, 2);
        truffleAssert.eventEmitted(voteResult1, "Voted", {candidate: account3});
        truffleAssert.eventEmitted(voteResult1, "NewWinner", (winner) => {
            return winner[0].winnerAddress === account3 && winner[0].voteCount === '1';
        });
        truffleAssert.eventEmitted(voteResult2, "Voted", {candidate: account3});
        truffleAssert.eventEmitted(voteResult2, "NewWinner", (winner) => {
            return winner[0].winnerAddress === account3 && winner[0].voteCount === '2';
        });
    });

    it("should not let vote for non candidate", async () => {
        const votingMachine = await VotingMachine.new(2, 0, 10);

        await truffleAssert.reverts(votingMachine.vote(account2, {from: account1}));
    });

    it("should return 0x as winner when no votes", async () => {
        const votingMachine = await VotingMachine.new(2, 0, 10);

        const winner = await votingMachine.winner();

        assert.equal(winner.winnerAddress, 0x0000000000000000000000000000000000000000);
        assert.equal(winner.voteCount, 0);
    });

    it("should let 3 voters vote for 2 candidates", async () => {
        const votingMachine = await VotingMachine.new(2, 0, 10);
        await votingMachine.registerCandidate({from: account1});
        await votingMachine.registerCandidate({from: account2});

        const voteResult1 = await votingMachine.vote(account1, {from: account1});
        const voteResult2 = await votingMachine.vote(account1, {from: account2});
        const voteResult3 = await votingMachine.vote(account2, {from: account3});

        const winner = await votingMachine.winner();
        assert.equal(winner.winnerAddress, account1);
        assert.equal(winner.voteCount, 2);
        truffleAssert.eventEmitted(voteResult1, "Voted", {candidate: account1});
        truffleAssert.eventEmitted(voteResult1, "NewWinner", (winner) => {
            return winner[0].winnerAddress === account1 && winner[0].voteCount === '1';
        });
        truffleAssert.eventEmitted(voteResult2, "Voted", {candidate: account1});
        truffleAssert.eventEmitted(voteResult2, "NewWinner", (winner) => {
            return winner[0].winnerAddress === account1 && winner[0].voteCount === '2';
        });
        truffleAssert.eventEmitted(voteResult3, "Voted", {candidate: account2});
        truffleAssert.eventNotEmitted(voteResult3, "NewWinner");
    });
});