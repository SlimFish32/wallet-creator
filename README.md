# Wallet Creator

This application is a simple tool to seed many wallets from a single source wallet.

## Prerequisites

Nodejs 8 or higher is required. [Download Page](https://nodejs.org/en/download/)

The seed phrase of an wallet with founds to use the application.

## Installation

Open a terminal and execute the following command

```bash
npm i -g @slimfish/wallet-creator@latest
```

## Usage

Open a new terminal and execute the following command and follow the instructions

```bash
npx wallet-creator
```

## Options available

The following options are available on the application

- **Seed founds from a wallet into multiple new accounts**

    This procedure takes care of the creation of a set of new wallets.

    It will require the user to provide the seed phrase of the wallet to use as source. the amount of founds to be used.

    From there the application will compute the number of wallets that can be seeded and proceed to send the founds to those wallets

    The information about those wallets will be stored on a file named accounts.csv. that will be located on the same directory that the application was executed.

    If you want to stop the process press `Control+C` anytime. the founds that are already seeded will remain on the target wallets

- **Recover seeded founds from the wallets**

    There is an option to recover the founds seeded. To do this, the application requires that the log file stays untouched.

    This process will require the user to provide the seed phrase of the wallet that will receive the founds.

    There's also an option to convert the StableCoin `BUSD` to `BNB` Prior to the recovery of the founds. (The approval on PancakeSwap is handled by the application)

- **List the logged accounts**

    There's also an option to list the accounts that the application has created

## Disclaimer

The application is provided as is, without any warranty.

Be aware that the application uses the founds present at the wallet provided by the user and the network fees will be applied on every transaction.

An special warning has to be mentioned. If for any reason you delete the Accounts.csv, all the accounts / founds present there will be lost with no way to recover them. There's no backup method for that data.
