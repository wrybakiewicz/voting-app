.PHONY: test

test:
	truffle test

compile:
	truffle compile

migrate:
	make compile
	truffle migrate

develop:
	truffle develop