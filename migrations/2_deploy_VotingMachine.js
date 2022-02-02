const VotingMachine = artifacts.require("VotingMachine");

module.exports = function (deployer) {
    deployer.deploy(VotingMachine, 60 * 60 * 1, 60 * 60 * 2, 60 * 60 * 3);
};
